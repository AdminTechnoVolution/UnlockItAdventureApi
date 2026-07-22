const logger = require('../config/logger');
const path = require('path');
const filename = path.basename(__filename);
const constants = require('../constants/constants');
const { isSwaggerRequest } = require('./loggingFilters');

const MAX_LOG_BODY_LENGTH = 4000;

const sanitizeValue = (value, key = '') => {
    if (value === null || value === undefined) {
        return value;
    }

    if (Array.isArray(value)) {
        return value.map((item) => sanitizeValue(item));
    }

    if (typeof value === 'object' && !Buffer.isBuffer(value)) {
        const clone = {};

        for (const [childKey, childValue] of Object.entries(value)) {
            if (constants.SENSITIVE_KEYS.includes(childKey.toLowerCase())) {
                clone[childKey] = constants.MASK_SENSITIVE_KEYS;
                continue;
            }

            clone[childKey] = sanitizeValue(childValue, childKey);
        }

        return clone;
    }

    if (typeof value === 'string') {
        if (constants.SENSITIVE_KEYS.includes(key.toLowerCase())) {
            return constants.MASK_SENSITIVE_KEYS;
        }

        if (value.length > constants.MAX_CHARS_LOG_PER_STRING) {
            return `${value.slice(0, constants.MAX_CHARS_LOG_PER_STRING)}...`;
        }
    }

    return value;
};

const sanitizeFiles = (file, files) => {
    if (file) {
        return [{
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
        }];
    }

    if (Array.isArray(files)) {
        return files.map((f) => ({
            fieldname: f.fieldname,
            originalname: f.originalname,
            mimetype: f.mimetype,
            size: f.size,
        }));
    }

    return undefined;
};

function sanitize(body, file, files) {
    if (!body && !file && !files) return body;

    const sanitizedBody = sanitizeValue(body);
    const safeFiles = sanitizeFiles(file, files);

    return { body: sanitizedBody, files: safeFiles };
}

function logRequest(req, res, next) {
    if (isSwaggerRequest(req)) {
        return next();
    }

    req._requestStartTime = Date.now();

    const sanitizedPayload = sanitize(req.body, req.file, req.files);
    let bodyAndFilesSanitized = JSON.stringify(sanitizedPayload);

    if (bodyAndFilesSanitized === undefined) {
        bodyAndFilesSanitized = '{}';
    }

    if (bodyAndFilesSanitized.length > MAX_LOG_BODY_LENGTH) {
        bodyAndFilesSanitized = `${bodyAndFilesSanitized.slice(0, MAX_LOG_BODY_LENGTH)}...`;
    }

    const message = `Incoming Method: [${req.method}] Path: [${req.originalUrl}] SanitizedBody: ${bodyAndFilesSanitized}`;

    logger.info({ message: message, className: filename, req: req });
    next();
}

module.exports = logRequest;
