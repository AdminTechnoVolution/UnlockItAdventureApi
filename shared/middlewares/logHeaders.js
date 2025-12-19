const logger = require('../config/logger');
const path = require('path');
const filename = path.basename(__filename);
const constants = require('../constants/constants');

function sanitizeHeaders(headers) {
    if (!headers || typeof headers !== 'object') return headers;

    const clone = { ...headers };

    for (const key of Object.keys(clone)) {
        if (constants.SENSITIVE_KEYS.includes(key.toLowerCase())) {
            clone[key] = constants.MASK_SENSITIVE_KEYS;
        }
    }

    return clone;
}


function logHeaders(req, res, next) {
    const sanitizedHeaders = sanitizeHeaders(req.headers);
    const message = `Headers: ${JSON.stringify(sanitizedHeaders)}`;

    logger.info({ message, className: filename, req: req });
    next();
}

module.exports = logHeaders;
