require('winston-daily-rotate-file');
const requestContext = require('./requestContext');
const winston = require('winston');
const { combine, timestamp, printf, errors } = winston.format;
const MAX_CORRID_WIDTH = 0;
const MAX_CLASSNAME_WIDTH = 0;
const MAX_LEVEL_WIDTH = 0;
const MAX_IP_WIDTH = 0;

const transport = new winston.transports.DailyRotateFile({
    filename: 'logs/unlockit-adventure-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '5m',
    maxFiles: '30d'
});

const logFormat = printf(({ timestamp, level, message, className, stack, req }) => {
    const paddedClassName = `[${className}]`.padEnd(MAX_CLASSNAME_WIDTH);
    const paddedLevel = `[${level}]`.padEnd(MAX_LEVEL_WIDTH);
    const paddedIp = `[${req?.ip}]`.padEnd(MAX_IP_WIDTH);
    let correlationId;
    if (req?.correlationId) {
        correlationId = req.correlationId;
    } else {
        correlationId = requestContext.get()?.correlationId || '';
    }

    const parts = [
        timestamp,
        paddedLevel,
        paddedClassName,
        paddedIp,
    ];

    if (correlationId) {
        parts.push(`[${correlationId}]`.padEnd(MAX_CORRID_WIDTH));
    }

    parts.push(stack || message);

    return parts.join(' ');
});

const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        errors({ stack: true }),
        logFormat
    ),
    transports: [
        transport,
        new winston.transports.Console()
    ]
});

module.exports = logger;