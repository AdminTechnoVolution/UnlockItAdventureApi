const Joi = require('joi');
const { ERROR_CODES } = require('../../shared/i18n/messages');
const AuthType = require('../../shared/constants/enums/EnumAuthType');
const Platforms = require('../../shared/constants/enums/EnumPlatforms');

const deviceSchema = Joi.object({
    fcmToken: Joi.string().trim().optional()
        .messages({
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
        }),
    platform: Joi.string().valid(...Object.values(Platforms)).required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'any.only': ERROR_CODES.FIELD_INVALID,
        }),
    appVersion: Joi.string().trim().max(32).optional()
        .messages({
            'string.max': ERROR_CODES.FIELD_MAX,
        }),
    deviceId: Joi.string().trim().max(128).optional()
        .messages({
            'string.max': ERROR_CODES.FIELD_MAX,
        }),
});

const socialLoginSchema = Joi.object({
    authType: Joi.string().valid(...Object.values(AuthType)).required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'any.only': ERROR_CODES.FIELD_INVALID,
        }),
    tokenId: Joi.string().trim().required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
        }),
    device: deviceSchema.required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
        }),
});

const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().trim().required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
        }),
});

const logoutSchema = Joi.object({
    accessToken: Joi.string().trim().required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
        }),
    refreshToken: Joi.string().trim().required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
        }),
    fcmToken: Joi.string().trim().optional()
        .messages({
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
        }),
});

module.exports = {
    socialLoginSchema,
    refreshTokenSchema,
    logoutSchema,
};
