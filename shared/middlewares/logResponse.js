const logger = require('../config/logger');
const path = require('path');
const filename = path.basename(__filename);
const constants = require('../constants/constants');

function sanitize(obj) {
    if (!obj) return obj;

    if (typeof obj === 'string') {
        try {
            obj = JSON.parse(obj);
        } catch (e) {
            return obj.length > constants.MAX_CHARS_LOG_PER_STRING ? `[TRUNCATED ${obj.length} chars]` : obj;
        }
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(item => sanitize(item));
    }

    // Handle objects
    if (typeof obj === 'object') {
        const clone = {};
        for (const [key, value] of Object.entries(obj)) {
            if (constants.SENSITIVE_KEYS.includes(key.toLowerCase())) {
                clone[key] = constants.MASK_SENSITIVE_KEYS;
            } else {
                clone[key] = sanitize(value);
            }
        }
        return clone;
    }

    // Handle strings
    if (typeof obj === 'string') {
        return obj.length > constants.MAX_CHARS_LOG_PER_STRING ? `[TRUNCATED ${obj.length} chars]` : obj;
    }

    // Everything else (numbers, booleans, etc.)
    return obj;
}

function logResponse(req, res, next) {
    const originalSend = res.send;
    res.send = function (body) {
        try {
            const bodyAndFilesSanitized = JSON.stringify(sanitize(body));
            const message = `Response Method: [${req.method}] Path: [${req.originalUrl}] Body: ${bodyAndFilesSanitized}`;
            logger.info({ message: message, className: filename, req: req });
        } catch (err) {
            logger.error({ message: constants.ERROR_GENERIC_LOGGING_RESPONSE, className: filename, req: req });
        }
        return originalSend.call(this, body);
    };

    next();
}

module.exports = logResponse;
