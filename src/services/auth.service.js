const path = require('path');
const crypto = require('crypto');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const BaseResponse = require('../../shared/commons/models/BaseResponse');
const BusinessException = require('../../shared/commons/models/BusinessException');
const User = require('../models/user.model');
const UserRepository = require('../repository/user.repository');
const UserStatus = require('../../shared/constants/enums/EnumUserStatus');
const redisClient = require('../../shared/config/redis');
const util = require('../../shared/util/util');
const jwt = require('../../shared/util/jwt');
const AuthType = require('../../shared/constants/enums/EnumAuthType');
const { verifyGoogleToken } = require('../clients/google');
const constants = require('../../shared/constants/constants');
const consCache = require('../../shared/constants/constants.cache');
const env = require('../../shared/constants/environmentSystemVariables');
const { SUCCESS_CODES, ERROR_CODES } = require('../../shared/i18n/messages');
const { translate } = require('../../shared/util/util');

const socialLogin = async (req) => {
    const acceptLanguage = req.acceptLanguage;
    const { authType, tokenId } = req.body;

    const profile = await verifyProviderToken(authType, tokenId, req);
    const { user, isNewUser } = await findOrCreateSocialUser(authType, profile, req);

    user.lastLogin = new Date();
    await UserRepository.save(user, req);

    const tokens = await issueAuthTokens(user);

    const message = translate(SUCCESS_CODES.CODE_LOGIN_SUCCESS, acceptLanguage);

    return new BaseResponse(true, [message], {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isNewUser,
    });
};

const verifyProviderToken = async (authType, tokenId, req) => {
    try {
        let profile;

        if (authType === AuthType.GOOGLE) {
            profile = await verifyGoogleToken(tokenId);
        } else if (authType === AuthType.APPLE) {
            // TODO: Implement Apple ID token verification.
            throw new Error('Apple authentication is not implemented yet');
        } else {
            throw new Error(`Unsupported auth type: ${authType}`);
        }

        if (!profile.providerId) {
            throw new BusinessException(ERROR_CODES.CODE_SOCIAL_AUTH_FAILED, constants.HTTP_UNAUTHORIZED);
        }

        return profile;
    } catch (error) {
        logger.error({
            message: `Social token verification failed for authType=${authType}. Error: ${error.message}`,
            className: filename,
            req,
        });
        throw new BusinessException(ERROR_CODES.CODE_SOCIAL_AUTH_FAILED, constants.HTTP_UNAUTHORIZED);
    }
};

const findOrCreateSocialUser = async (authType, profile, req) => {
    let user = await UserRepository.findOneByFilter({ authType, providerId: profile.providerId }, req);

    if (user) {
        return { user, isNewUser: false };
    }

    if (profile.email) {
        user = await UserRepository.findOneByFilter({ email: profile.email }, req);
    }

    if (user) {
        user.authType = authType;
        user.providerId = profile.providerId;
        user.status = UserStatus.ACTIVE;
        user.verificationExpiresAt = undefined;

        if (profile.fullName && !user.fullName) {
            user.fullName = profile.fullName;
        }

        if (profile.profileImageUrl && !user.profileImageUrl) {
            user.profileImageUrl = profile.profileImageUrl;
        }

        return { user, isNewUser: false };
    }

    if (!profile.email) {
        throw new BusinessException(ERROR_CODES.CODE_SOCIAL_AUTH_EMAIL_REQUIRED, constants.HTTP_BAD_REQUEST);
    }

    const username = await generateUniqueUsername(req);
    const fullName = profile.fullName || profile.email.split('@')[0];

    user = new User({
        email: profile.email,
        username,
        password: crypto.randomBytes(32).toString('hex'),
        fullName,
        profileImageUrl: profile.profileImageUrl,
        authType,
        providerId: profile.providerId,
        status: UserStatus.ACTIVE,
    });

    await UserRepository.save(user, req);

    return { user, isNewUser: true };
};

const issueAuthTokens = async (user) => {
    const payload = {
        id: user._id,
        email: user.email,
    };

    const payloadRefresh = {
        id: user._id,
        email: user.email,
        hash: util.generateRandomHash(),
    };

    const accessToken = await saveTokenInRedis(
        jwt.generateToken(payload, env.JWT_ACCESS_TOKEN_TTL_SECS),
        payload,
        env.JWT_ACCESS_TOKEN_TTL_SECS,
        `${consCache.REDIS_KEY_ACCESS_TOKEN}${payload.id}:`
    );

    const refreshToken = await saveTokenInRedis(
        jwt.generateToken(payloadRefresh, env.JWT_REFRESH_TOKEN_TTL_SECS),
        payloadRefresh,
        env.JWT_REFRESH_TOKEN_TTL_SECS,
        `${consCache.REDIS_KEY_REFRESH_TOKEN}${payloadRefresh.id}:`
    );

    return { accessToken, refreshToken };
};

const saveTokenInRedis = async (token, payload, ttl, redisKeyPrefix) => {
    const key = util.getKeyRedis(`${redisKeyPrefix}${token}`);
    await redisClient.setEx(key, ttl, JSON.stringify(payload));
    return token;
};

const generateUniqueUsername = async (req) => {
    while (true) {
        const username = generateUsername();
        const exists = await UserRepository.existsByFilter({ username }, req);

        if (!exists) {
            return username;
        }
    }
};

const generateUsername = (prefix = 'Guest') => {
    const timestamp = Date.now();
    const random = util.generateSecureRandom(100, 999);
    return `${prefix}_${timestamp}_${random}`;
};

module.exports = {
    socialLogin,
};
