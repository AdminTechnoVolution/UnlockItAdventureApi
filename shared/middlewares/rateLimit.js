const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const BaseResponse = require('../commons/models/BaseResponse');
const constants = require('../constants/constants');
const env = require('../constants/environmentSystemVariables');
const { ERROR_CODES } = require('../i18n/messages');
const { translate } = require('../util/util');
const redisClient = require('../config/redis');

const createRateLimitHandler = () => (req, res) => {
    const message = translate(ERROR_CODES.CODE_RATE_LIMIT_EXCEEDED, req.acceptLanguage);
    const response = new BaseResponse(false, [message]);
    res.status(constants.HTTP_TOO_MANY_REQUESTS).json(response);
};

const createStore = (scope) => {
    if (env.RATE_LIMIT_USE_MEMORY === 'true') {
        return undefined;
    }

    return new RedisStore({
        prefix: `${env.REDIS_APP_NAME}:rl:${scope}:`,
        sendCommand: (...args) => redisClient.sendCommand(args),
    });
};

const createGlobalRateLimiter = () => {
    if (env.RATE_LIMIT_ENABLED !== 'true') {
        return (req, res, next) => next();
    }

    return rateLimit({
        windowMs: env.RATE_LIMIT_WINDOW_MS,
        max: env.RATE_LIMIT_MAX_REQUESTS,
        standardHeaders: true,
        legacyHeaders: false,
        store: createStore('global'),
        handler: createRateLimitHandler(),
        validate: {
            trustProxy: false,
        },
    });
};

const createAuthRateLimiter = () => {
    if (env.RATE_LIMIT_ENABLED !== 'true') {
        return (req, res, next) => next();
    }

    return rateLimit({
        windowMs: env.RATE_LIMIT_AUTH_WINDOW_MS,
        max: env.RATE_LIMIT_AUTH_MAX_REQUESTS,
        standardHeaders: true,
        legacyHeaders: false,
        store: createStore('auth'),
        handler: createRateLimitHandler(),
        validate: {
            trustProxy: false,
        },
    });
};

module.exports = {
    createGlobalRateLimiter,
    createAuthRateLimiter,
};
