const logger = require('../config/logger');
const path = require('path');
const filename = path.basename(__filename);
const constants = require('../constants/constants');

function logResponse(req, res, next) {
    res.on('finish', () => {
        try {
            const durationMs = Date.now() - (req._requestStartTime || Date.now());
            const message = `${req.method} ${req.originalUrl} - ${durationMs}ms`;
            logger.info({ message, className: filename, req });
        } catch (_err) {
            logger.error({ message: constants.ERROR_GENERIC_LOGGING_RESPONSE, className: filename, req });
        }
    });

    next();
}

module.exports = logResponse;
