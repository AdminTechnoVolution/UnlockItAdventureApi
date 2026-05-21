const path = require('path');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const BaseResponse = require('../../shared/commons/models/BaseResponse');
const BusinessException = require('../../shared/commons/models/BusinessException');
const User = require('../models/user.model');
const FCMToken = require('../models/fcmToken.model');
const UserRepository = require('../repository/user.repository');
const FCMTokenRepository = require('../repository/fcmToken.repository');
const UserStatus = require('../../shared/constants/enums/EnumUserStatus');
const redisClient = require('../../shared/config/redis');
const util = require('../../shared/util/util');
const jwt = require('../../shared/util/jwt');
const constants = require('../../shared/constants/constants');
const consCache = require('../../shared/constants/constants.cache');
const env = require('../../shared/constants/environmentSystemVariables');
const mailer = require('../../shared/config/email');
const bcrypt = require('bcryptjs');
const { SUCCESS_CODES, ERROR_CODES, EMAIL_SUBJECTS, EMAIL_TEMPLATES } = require('../../shared/i18n/messages');
const { translate } = require('../../shared/util/util');

const registerUser = async (req) => {
    const acceptLanguage = req.acceptLanguage;
    const body = req.body;

    await validateUserInput(body, req);

    const now = new Date();
    const { email, password, fullName } = body;

    const verificationCode = util.generateVerificationCode();
    const hashedPassword = await util.generateHash(password, true);
    const hashedVerificationCode = await util.generateHash(verificationCode, false);
    const verificationExpiresAt = new Date(now.getTime() + env.RESETCODE_REDIS_TTL_SECS * 1000);
    const verificationExpireMins = env.RESETCODE_REDIS_TTL_SECS / 60;
    const username = await generateUniqueUsername(email, req);

    const user = new User({
        email: email,
        username: username,
        password: hashedPassword,
        fullName: fullName,
        verificationExpiresAt: verificationExpiresAt,
    });

    const userCreated = await UserRepository.save(user, req);

    const redisKeyResendVerificationCode = util.getKeyRedis(`${consCache.REDIS_KEY_RESEND_VERIFICATION_CODES}${userCreated._id}`);
    const valueKeyVerification = JSON.stringify({ email: email.toLowerCase() });
    const redisKeyVerificationCode = util.getKeyRedis(`${consCache.REDIS_KEY_VERIFICATION_CODES}${userCreated._id}`);
    const value = JSON.stringify({ code: hashedVerificationCode, attempts: 0 });

    await redisClient.setEx(redisKeyVerificationCode, env.RESETCODE_REDIS_TTL_SECS, value);
    await redisClient.setEx(redisKeyResendVerificationCode, env.RESEND_RESETCODE_REDIS_TTL_SECS, valueKeyVerification);

    sendRegistrationEmail(email, verificationCode, fullName, verificationExpireMins, acceptLanguage);

    const message = translate(SUCCESS_CODES.CODE_REGISTER_SUCCESS, acceptLanguage);
    const data = { resendCodeInSecs: env.RESEND_RESETCODE_REDIS_TTL_SECS };
    return new BaseResponse(true, [message], data);
}

const verifyCodeUser = async (req) => {
    const acceptLanguage = req.acceptLanguage;
    const { email, verificationCode } = req.body;

    const user = await UserRepository.findOneByFilter({ email: email, status: UserStatus.PENDING }, req);
    if (!user) throw new BusinessException(ERROR_CODES.CODE_USER_NOT_FOUND, constants.HTTP_SUCCESS);

    const hashedVerificationCode = await util.generateHash(verificationCode, false);
    const redisKeyVerificationCode = util.getKeyRedis(`${consCache.REDIS_KEY_VERIFICATION_CODES}${user._id}`);
    const redisKeyResendVerificationCode = util.getKeyRedis(`${consCache.REDIS_KEY_RESEND_VERIFICATION_CODES}${user._id}`);
    let userResetCode = await redisClient.get(redisKeyVerificationCode);

    if (!userResetCode) throw new BusinessException(ERROR_CODES.CODE_EXPIRED_VERIFICATION_CODE, constants.HTTP_SUCCESS);

    userResetCode = JSON.parse(userResetCode);

    if (userResetCode.code !== hashedVerificationCode) {
        userResetCode.attempts += 1;
        if (userResetCode.attempts >= env.MAX_ATTEMPTS_VERIFY_CODE) {
            await redisClient.del(redisKeyVerificationCode);
        } else {
            const value = JSON.stringify(userResetCode);
            await redisClient.set(redisKeyVerificationCode, value, { KEEPTTL: true });
        }
        throw new BusinessException(ERROR_CODES.CODE_INVALID_VERIFICATION_CODE, constants.HTTP_SUCCESS);
    }

    user.status = UserStatus.ACTIVE;
    user.verificationExpiresAt = undefined;

    await UserRepository.save(user, req);
    await redisClient.del(redisKeyVerificationCode);
    await redisClient.del(redisKeyResendVerificationCode);

    const message = translate(SUCCESS_CODES.CODE_VERIFICATION_SUCCESS, acceptLanguage);
    return new BaseResponse(true, [message]);
};

const sendVerificationCode = async (req) => {
    const acceptLanguage = req.acceptLanguage;
    const body = req.body;
    const { email } = body;

    const user = await UserRepository.findOneByFilter({ email: email }, req);
    if (!user) throw new BusinessException(ERROR_CODES.CODE_USER_NOT_FOUND, constants.HTTP_SUCCESS);

    await validateAlreadySendCode(user);

    const verificationCode = util.generateVerificationCode();
    const hashedVerificationCode = await util.generateHash(verificationCode, false);
    const verificationExpireMins = env.RESETCODE_REDIS_TTL_SECS / 60;
    const redisKeyResendVerificationCode = util.getKeyRedis(`${consCache.REDIS_KEY_RESEND_VERIFICATION_CODES}${user._id}`);
    const valueKeyVerification = JSON.stringify({ email: email.toLowerCase() });

    const redisKeyVerificationCode = util.getKeyRedis(`${consCache.REDIS_KEY_VERIFICATION_CODES}${user._id}`);
    const value = JSON.stringify({ code: hashedVerificationCode, attempts: 0 });

    await redisClient.setEx(redisKeyVerificationCode, env.RESETCODE_REDIS_TTL_SECS, value);
    await redisClient.setEx(redisKeyResendVerificationCode, env.RESEND_RESETCODE_REDIS_TTL_SECS, valueKeyVerification);

    sendVerificationCodeEmail(email, verificationCode, user.fullName, verificationExpireMins, acceptLanguage);

    const message = translate(SUCCESS_CODES.CODE_SENT_SUCCESS, acceptLanguage);
    const data = { resendCodeInSecs: env.RESEND_RESETCODE_REDIS_TTL_SECS };
    return new BaseResponse(true, [message], data);
};

const resetPassword = async (req) => {
    const acceptLanguage = req.acceptLanguage;
    const body = req.body;
    const { email, password, verificationCode } = body;

    const user = await UserRepository.findOneByFilter({ email: email, status: UserStatus.ACTIVE }, req);
    if (!user) throw new BusinessException(ERROR_CODES.CODE_USER_NOT_FOUND, constants.HTTP_SUCCESS);

    const hashedVerificationCode = await util.generateHash(verificationCode, false);
    const redisKeyVerificationCode = util.getKeyRedis(`${consCache.REDIS_KEY_VERIFICATION_CODES}${user._id}`);
    let userResetCode = await redisClient.get(redisKeyVerificationCode);

    if (!userResetCode) throw new BusinessException(ERROR_CODES.CODE_EXPIRED_VERIFICATION_CODE, constants.HTTP_SUCCESS);

    userResetCode = JSON.parse(userResetCode);

    if (userResetCode.code !== hashedVerificationCode) {
        userResetCode.attempts += 1;
        if (userResetCode.attempts >= env.MAX_ATTEMPTS_VERIFY_CODE) {
            await redisClient.del(redisKeyVerificationCode);
        } else {
            const value = JSON.stringify(userResetCode);
            await redisClient.set(redisKeyVerificationCode, value, { KEEPTTL: true });
        }
        throw new BusinessException(ERROR_CODES.CODE_INVALID_VERIFICATION_CODE, constants.HTTP_SUCCESS);
    }

    const hashedPassword = await util.generateHash(password, true);

    user.password = hashedPassword;

    await UserRepository.save(user, req);

    await redisClient.del(redisKeyVerificationCode);
    deleteRedisTokens(user._id.toString());
    deleteFcmTokens(user._id.toString(), req);

    const message = translate(SUCCESS_CODES.CODE_RESET_PASSWORD_SUCCESS, acceptLanguage);
    return new BaseResponse(true, [message]);
};

const loginUser = async (req) => {
    let { email, password, device } = req.body;
    const user = await UserRepository.findOneByFilter({ email: email, status: UserStatus.ACTIVE }, req);

    if (!user) throw new BusinessException(ERROR_CODES.CODE_ERROR_LOGIN, constants.HTTP_UNAUTHORIZED);
    let isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) throw new BusinessException(ERROR_CODES.CODE_ERROR_LOGIN, constants.HTTP_UNAUTHORIZED);

    const payload = {
        id: user._id,
        email: user.email
    };

    const payloadRefresh = {
        id: user._id,
        email: user.email,
        hash: util.generateRandomHash(),
    };

    const result = await FCMTokenRepository.findOneByFilter({ userId: user._id }, req);
    if (result) {
        const existsFcmToken = result.devices.some(i => i.fcmToken === device.fcmToken);

        if (!existsFcmToken) {
            result.devices.push({ fcmToken: device.fcmToken, platform: device.platform, appVersion: device.appVersion, deviceId: device.deviceId });
            await FCMTokenRepository.save(result, req);
        }
    } else {
        const fcmTokenDoc = new FCMToken({
            userId: user._id,
            devices: [device],
        });
        await FCMTokenRepository.save(fcmTokenDoc, req);
    }

    const accessToken = await generateTokenAndSaveToken(payload, env.JWT_ACCESS_TOKEN_TTL_SECS, `${consCache.REDIS_KEY_ACCESS_TOKEN}${payload.id}:`);
    const refreshToken = await generateTokenAndSaveToken(payloadRefresh, env.JWT_REFRESH_TOKEN_TTL_SECS, `${consCache.REDIS_KEY_REFRESH_TOKEN}${payloadRefresh.id}:`);

    const currentDate = new Date();
    const userData = { lastLogin: currentDate };
    UserRepository.findByIdAndUpdate(user._id, userData, req);

    return new BaseResponse(true, [], { accessToken, refreshToken });
};

const refreshTokenUser = async (req) => {
    let { refreshToken } = req.body;
    const { decoded } = jwt.verifyJwtToken(refreshToken, false);
    if (!decoded) throw new BusinessException(ERROR_CODES.CODE_ERROR_AUTH, constants.HTTP_UNAUTHORIZED);

    const user = {
        _id: decoded['id'],
        email: decoded['email']
    };

    const tokenConcat = util.getKeyRedis(`${consCache.REDIS_KEY_REFRESH_TOKEN}${user._id}:${refreshToken}`);
    const exists = await redisClient.exists(tokenConcat);
    if (exists !== 1) {
        throw new BusinessException(ERROR_CODES.CODE_ERROR_AUTH, constants.HTTP_UNAUTHORIZED);
    }

    const payload = {
        id: user._id,
        email: user.email
    };

    const payloadRefresh = {
        id: user._id,
        email: user.email,
        hash: util.generateRandomHash(),
    };

    await redisClient.del(tokenConcat);

    const accessToken = await generateTokenAndSaveToken(payload, env.JWT_ACCESS_TOKEN_TTL_SECS, `${consCache.REDIS_KEY_ACCESS_TOKEN}${payload.id}:`);
    refreshToken = await generateTokenAndSaveToken(payloadRefresh, env.JWT_REFRESH_TOKEN_TTL_SECS, `${consCache.REDIS_KEY_REFRESH_TOKEN}${payloadRefresh.id}:`);

    const currentDate = new Date();
    const userData = { lastLogin: currentDate };
    UserRepository.findByIdAndUpdate(user._id, userData, req);

    return new BaseResponse(true, [], { accessToken, refreshToken });
}

const logoutUser = async (req) => {
    try {
        let { accessToken, refreshToken, fcmToken } = req.body;

        FCMTokenRepository.findOneByFilterAndPullToken(
            { "devices.fcmToken": fcmToken },
            { devices: { fcmToken: fcmToken } },
            req
        );

        const { decoded: decodedAccessToken } = jwt.verifyJwtToken(accessToken, false);
        const { decoded: decodedRefreshToken } = jwt.verifyJwtToken(refreshToken, false);

        if (decodedAccessToken) {
            const key = util.getKeyRedis(`${consCache.REDIS_KEY_ACCESS_TOKEN}${decodedAccessToken['id']}:${accessToken}`);
            redisClient.del(key);
        }

        if (decodedRefreshToken) {
            const key = util.getKeyRedis(`${consCache.REDIS_KEY_REFRESH_TOKEN}${decodedRefreshToken['id']}:${refreshToken}`);
            redisClient.del(key);
        }
    } catch (err) {
        logger.error({ message: `Error logout: ${err}`, className: filename, req: req });
    }

    return new BaseResponse(true);
}

const validateUserInput = async (body, req) => {
    const existingUser = await UserRepository.findOneByFilter({ email: body.email }, req);

    if (existingUser) throw new BusinessException(ERROR_CODES.CODE_USER_EXISTS, constants.HTTP_SUCCESS);

    return existingUser;
};

const validateAlreadySendCode = async (user) => {
    const key = util.getKeyRedis(`${consCache.REDIS_KEY_RESEND_VERIFICATION_CODES}${user._id}`);

    const ttl = await redisClient.ttl(key);
    if (ttl > 0) throw new BusinessException(ERROR_CODES.CODE_RESEND_VERIFICATION_CODE_TOO_MANY_REQUESTS, constants.HTTP_TOO_MANY_REQUESTS);
};

const sendVerificationCodeEmail = async (email, code, name, verificationExpireMins, acceptLanguage) => {
    let subject = translate(EMAIL_SUBJECTS.VERIFICATION_CODE, acceptLanguage);
    let html = translate(EMAIL_TEMPLATES.VERIFICATION_CODE, acceptLanguage);
    html = html
        .replace(/\[name\]/g, name)
        .replace(/\[code\]/g, code)
        .replace(/\[verificationExpireMins\]/g, verificationExpireMins);
    await sendEmail(email, subject, html);
};

const sendRegistrationEmail = async (email, code, name, verificationExpireMins, acceptLanguage) => {
    let subject = translate(EMAIL_SUBJECTS.VERIFICATION_CODE, acceptLanguage);
    let html = translate(EMAIL_TEMPLATES.USER_REGISTRATION, acceptLanguage);
    html = html
        .replace(/\[name\]/g, name)
        .replace(/\[code\]/g, code)
        .replace(/\[verificationExpireMins\]/g, verificationExpireMins);
    await sendEmail(email, subject, html);
};

const sendEmail = async (email, subject, html) => {
    await mailer.sendEmail(email, subject, html);
};

const generateTokenAndSaveToken = async (payload, ttl, redisKey) => {
    const token = jwt.generateToken(payload, ttl);
    const key = util.getKeyRedis(`${redisKey}${token}`);

    await redisClient.setEx(key, ttl, JSON.stringify(payload));
    return token;
};

const deleteRedisTokens = async (userId) => {
    const dataAccessTokens = await getRedisDataByPattern(util.getKeyRedis(`${consCache.REDIS_KEY_ACCESS_TOKEN}${userId}:*`));
    const dataRefreshTokens = await getRedisDataByPattern(util.getKeyRedis(`${consCache.REDIS_KEY_REFRESH_TOKEN}${userId}:*`));

    await deleteKeysByUserId(dataAccessTokens, userId);
    await deleteKeysByUserId(dataRefreshTokens, userId);
}

const deleteFcmTokens = async (userId, req) => {
    await FCMTokenRepository.deleteAllByFilter({ userId: userId }, req);
}

const deleteKeysByUserId = async (data, userId) => {
    for (const item of data) {
        const value = JSON.parse(item.value);
        if (value.id === userId) {
            await redisClient.del(item.key);
        }
    }
}

const getRedisDataByPattern = async (pattern) => {
    const keys = [];

    for await (const key of redisClient.scanIterator({
        MATCH: pattern,
        COUNT: 100,
    })) {
        key.forEach(k => keys.push(k.toString()));
    }

    if (keys.length === 0) return [];

    const values = await redisClient.mGet(keys);
    return keys.map((k, i) => ({ key: k, value: values[i] }));
}

const generateUniqueUsername = async (email, req) => {
    while (true) {
        const username = generateUsername();
        const filter = { username };
        const exists = await UserRepository.existsByFilter(filter, req);
        logger.info(`Username generated [${username}] for email [${email}]`, { className: filename, req: req });
        if (!exists) return username;
    }
}

const generateUsername = (prefix = "Guest") => {
    const timestamp = Date.now();
    const min = 100;
    const max = 999;

    const random = util.generateSecureRandom(min, max);
    return `${prefix}_${timestamp}_${random}`;
}

module.exports = {
    registerUser,
    verifyCodeUser,
    sendVerificationCode,
    resetPassword,
    loginUser,
    refreshTokenUser,
    logoutUser
}
