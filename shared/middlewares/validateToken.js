const path = require('path');
const logger = require('../config/logger');
const filename = path.basename(__filename);
const BusinessException = require('../commons/models/BusinessException');
const { ERROR_CODES } = require('../i18n/messages');
const constants = require('../constants/constants');
const consCache = require('../constants/constants.cache');
const jwt = require('../util/jwt');
const util = require('../util/util');
const redisClient = require('../config/redis');

module.exports = async (req, res, next) => {
    const tokenBearer = req.headers['authorization'];

    if (!tokenBearer) throw new BusinessException(ERROR_CODES.CODE_ERROR_AUTH, constants.HTTP_UNAUTHORIZED);

    const { token, decoded } = jwt.verifyJwtToken(tokenBearer);

    if (!token) throw new BusinessException(ERROR_CODES.CODE_ERROR_AUTH, constants.HTTP_UNAUTHORIZED);

    try {
        const exists = await isTokenInRedis(token, decoded, req);
        if (!exists)
            throw new BusinessException(ERROR_CODES.CODE_ERROR_AUTH, constants.HTTP_UNAUTHORIZED);
        next();
    } catch (err) {
        logger.error({ message: `Error validating token: ${err}`, className: filename, req: req });
        throw new BusinessException(ERROR_CODES.CODE_ERROR_AUTH, constants.HTTP_UNAUTHORIZED);
    }
};

async function isTokenInRedis(token, decoded, req) {
    try {
        const tokenConcat = util.getKeyRedis(`${consCache.REDIS_KEY_ACCESS_TOKEN}${decoded.id}:${token}`);
        const exists = await redisClient.exists(tokenConcat);
        return exists === 1;
    } catch (err) {
        logger.error({ message: `Error validating or refreshing token: ${err}`, className: filename, req: req });
        return false;
    }
}