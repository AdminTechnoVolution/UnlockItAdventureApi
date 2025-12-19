const { v4: uuidv4 } = require('uuid');
const requestContext = require('../config/requestContext');
const env = require('../constants/environmentSystemVariables');

function setHeaders(req, res, next) {
    const correlationId = req.headers['x-correlation-id'] || uuidv4();
    const acceptLanguage = req.headers['accept-language'] || env.DEFAULT_LANGUAGE;
    const store = { correlationId, acceptLanguage };
    req.correlationId = correlationId;
    req.acceptLanguage = acceptLanguage;
    requestContext.run(store, () => {
        res.setHeader('x-correlation-id', correlationId);
        res.setHeader('accept-language', acceptLanguage);
        next();
    });
}

module.exports = setHeaders;
