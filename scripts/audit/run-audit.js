#!/usr/bin/env node
/**
 * Consolidated audit runner for UnlockIt Adventure API.
 * Usage: npm run audit
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const REPORT_DIR = path.join(ROOT, 'reports');

function run(command, options = {}) {
  const { allowFail = false } = options;
  try {
    const output = execSync(command, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024,
    });
    return { ok: true, output: output.trim() };
  } catch (err) {
    const output = [err.stdout, err.stderr, err.message].filter(Boolean).join('\n').trim();
    if (allowFail) return { ok: false, output };
    return { ok: false, output };
  }
}

function section(title, body) {
  return `## ${title}\n\n${body}\n\n`;
}

function main() {
  const timestamp = new Date().toISOString();
  const fileStamp = timestamp.replace(/[:.]/g, '-').slice(0, 19);
  const lines = [
    `# Informe de auditoría — ${timestamp}`,
    '',
    'Generado por `npm run audit`. Completar con revisión manual usando `.cursor/skills/auditoria-mejora-continua/CHECKLIST.md`.',
    '',
    '## Comandos ejecutados',
    '',
    '- `eslint .`',
    '- `npm audit --json`',
    '- `depcheck`',
    '',
  ];

  // ESLint
  const eslint = run('npx eslint . --format stylish', { allowFail: true });
  lines.push(section(
    'ESLint',
    eslint.ok
      ? '✅ Sin problemas reportados.\n\n```\n(sin salida)\n```'
      : `⚠️ Hallazgos:\n\n\`\`\`\n${eslint.output || 'Error ejecutando ESLint'}\n\`\`\``
  ));

  // npm audit
  const audit = run('npm audit --json', { allowFail: true });
  let auditSummary = 'No se pudo ejecutar npm audit.';
  if (audit.output) {
    try {
      const data = JSON.parse(audit.output);
      const meta = data.metadata?.vulnerabilities || {};
      auditSummary = [
        `| Severidad | Cantidad |`,
        `|-----------|----------|`,
        `| info | ${meta.info ?? 0} |`,
        `| low | ${meta.low ?? 0} |`,
        `| moderate | ${meta.moderate ?? 0} |`,
        `| high | ${meta.high ?? 0} |`,
        `| critical | ${meta.critical ?? 0} |`,
        '',
        audit.ok ? '✅ Sin vulnerabilidades por encima del umbral del comando.' : '⚠️ Revisar advisories con `npm audit`.',
      ].join('\n');
    } catch {
      auditSummary = `\`\`\`\n${audit.output.slice(0, 8000)}\n\`\`\``;
    }
  }
  lines.push(section('Dependencias (npm audit)', auditSummary));

  // depcheck
  const depcheck = run('npx depcheck --json', { allowFail: true });
  let depcheckSummary = '';
  if (depcheck.output) {
    try {
      const data = JSON.parse(depcheck.output);
      const unused = data.dependencies || [];
      const missing = Object.keys(data.missing || {});
      depcheckSummary = [
        `**Dependencias no usadas**: ${unused.length ? unused.join(', ') : 'ninguna'}`,
        `**Dependencias faltantes en package.json**: ${missing.length ? missing.join(', ') : 'ninguna'}`,
      ].join('\n');
    } catch {
      depcheckSummary = `\`\`\`\n${depcheck.output.slice(0, 4000)}\n\`\`\``;
    }
  } else {
    depcheckSummary = 'No se pudo ejecutar depcheck.';
  }
  lines.push(section('depcheck', depcheckSummary));

  // Heuristics (static project notes)
  lines.push(section(
    'Heurísticas del proyecto (revisión manual)',
    [
      '| Hallazgo | Severidad | Notas |',
      '|----------|-----------|-------|',
      '| Sin rate limiting | Alta | No hay `express-rate-limit` en rutas `/api/auth/` |',
      '| Proyecto sin tests | Media | `npm test` es placeholder |',
      '| JS sin TypeScript | Info | ESLint sustituye `strict` hasta migración |',
      '| Verificar variables implícitas | Media | Ej. asignaciones sin `let`/`const` en services |',
    ].join('\n')
  ));

  lines.push(section(
    'Próximos pasos',
    [
      '1. Corregir hallazgos ESLint de severidad error.',
      '2. Resolver vulnerabilidades npm audit high/critical.',
      '3. Completar CHECKLIST.md fases 4–6 (seguridad, performance, arquitectura).',
      '4. Priorizar fixes con skill `arquitectura-consistencia`.',
    ].join('\n')
  ));

  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  const reportPath = path.join(REPORT_DIR, `audit-${fileStamp}.md`);
  const content = lines.join('\n');
  fs.writeFileSync(reportPath, content, 'utf8');

  console.log(content);
  console.log('\n---\n');
  console.log(`Reporte guardado en: ${reportPath}`);

  if (!eslint.ok) process.exitCode = 1;
}

main();
