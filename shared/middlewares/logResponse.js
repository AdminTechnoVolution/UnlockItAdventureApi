const logger = require('../config/logger');
const path = require('path');
const filename = path.basename(__filename);
const constants = require('../constants/constants');
const { isSwaggerRequest } = require('./loggingFilters');

function logResponse(req, res, next) {
    if (isSwaggerRequest(req)) {
        return next();
    }

    res.on('finish', () => {
        try {
            const durationMs = Date.now() - (req._requestStartTime || Date.now());
            const message = `Outcoming method [${req.method}] Path: [${req.originalUrl}] HTTP Status: [${res.statusCode}] - ${durationMs}ms`;
            logger.info({ message, className: filename, req });
        } catch (_err) {
            logger.error({ message: constants.ERROR_GENERIC_LOGGING_RESPONSE, className: filename, req });
        }
    });

    next();
}

module.exports = logResponse;
