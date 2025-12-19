const path = require('path');
const logger = require('../config/logger');
const filename = path.basename(__filename);
const multer = require('multer');
const BaseResponse = require('../commons/models/BaseResponse');
const BusinessException = require('../commons/models/BusinessException');
const ClientException = require('../commons/models/ClientException');
const DataLayerException = require('../commons/models/DataLayerException');
const { ERROR_CODES } = require('../i18n/messages');
const { translate } = require('../util/util');

function errorHandler(err, req, res, next) {
    logger.error({ message: `Ingresando a errorHandler. Error: ${err}`, className: filename, req: req });
    let message = err.message;
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        const response = new BaseResponse(false, translate(ERROR_CODES.ERROR_MALFORMED_BAD_REQUEST, req.acceptLanguage));
        return res.status(err.status).json(response);
    }

    if (err instanceof BusinessException) {
        const response = new BaseResponse(false, [translate(message, req.acceptLanguage)]);
        return res.status(err.statusCode).json(response);
    }

    if (err instanceof DataLayerException) {
        const response = new BaseResponse(false, [translate(message, req.acceptLanguage)]);
        return res.status(err.statusCode).json(response);
    }

    if (err instanceof ClientException) {
        const response = new BaseResponse(false, [translate(message, req.acceptLanguage)]);
        return res.status(err.statusCode).json(response);
    }

    if (err instanceof multer.MulterError) {
        let response = new BaseResponse(false, [err.code]);
        return res.status(err.statusCode || 400).json(response);
    }

    const statusCode = err.statusCode || 500;
    message = ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR;

    const response = new BaseResponse(false, [translate(message, req.acceptLanguage)]);
    res.status(statusCode).json(response);
}

module.exports = errorHandler;
