const SWAGGER_PATH_PREFIX = '/api-docs';

const stripQueryString = (url = '') => {
    const queryIndex = url.indexOf('?');

    if (queryIndex === -1) {
        return url;
    }

    return url.slice(0, queryIndex);
};

const isSwaggerRequest = (req) => {
    const originalUrl = stripQueryString(req?.originalUrl || req?.url || '');

    return originalUrl === SWAGGER_PATH_PREFIX || originalUrl.startsWith(`${SWAGGER_PATH_PREFIX}/`);
};

module.exports = {
    isSwaggerRequest,
};
