const logger = require('../config/logger');
const path = require('path');
const filename = path.basename(__filename);
const constants = require('../constants/constants');

function sanitize(body, files) {
    if (!body && !files) return body;

    // Handle JSON or urlencoded (object)
    if (body && typeof body === 'object' && !Buffer.isBuffer(body)) {
        const clone = { ...body };
        for (const key of Object.keys(clone)) {
            if (constants.SENSITIVE_KEYS.includes(key.toLowerCase())) {
                clone[key] = constants.MASK_SENSITIVE_KEYS;
            }
        }
        body = clone;
    }

    // Handle multipart/form-data files (multer-style)
    let safeFiles;
    if (Array.isArray(files)) {
        safeFiles = files.map(f => ({
            fieldname: f.fieldname,
            originalname: f.originalname,
            mimetype: f.mimetype,
            size: f.size
        }));
    }

    return {
        body,
        files: safeFiles
    };
}

function logRequest(req, res, next) {
    req._requestStartTime = Date.now();

    const bodyAndFilesSanitized = JSON.stringify(sanitize(req.body, req.files));
    const message = `Incoming Method: [${req.method}] Path: [${req.originalUrl}] Body: ${bodyAndFilesSanitized}`;

    logger.info({ message: message, className: filename, req: req });
    next();
}

module.exports = logRequest;
