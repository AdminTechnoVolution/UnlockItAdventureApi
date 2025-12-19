const Joi = require('joi');
const { ERROR_CODES } = require('../../shared/i18n/messages');
const constants = require('../../shared/constants/constants');

const registerUserSchema = Joi.object({
    email: Joi.string().trim().max(256).email().required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'string.max': ERROR_CODES.FIELD_MAX,
            'string.email': ERROR_CODES.FIELD_INVALID
        }),
    password: Joi.string().min(8).max(128).pattern(new RegExp(constants.PASSWORD_PATTERN)).required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'string.min': ERROR_CODES.FIELD_MIN,
            'string.max': ERROR_CODES.FIELD_MAX,
            'string.pattern.base': ERROR_CODES.FIELD_PATTERN
        }),
    fullName: Joi.string().trim().max(128).required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'string.max': ERROR_CODES.FIELD_MAX
        })
});

const verifyCodeUserSchema = Joi.object({
    email: Joi.string().trim().max(256).email().required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'string.max': ERROR_CODES.FIELD_MAX,
            'string.email': ERROR_CODES.FIELD_INVALID
        }),
    verificationCode: Joi.string().max(64).pattern(/^\d+$/).required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'string.pattern.base': ERROR_CODES.FIELD_NUMBER_ONLY,
            'string.max': ERROR_CODES.FIELD_MAX
        })
});

const sendVerificationCodeSchema = Joi.object({
    email: Joi.string().trim().max(256).email().required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'string.max': ERROR_CODES.FIELD_MAX,
            'string.email': ERROR_CODES.FIELD_INVALID
        }),
});

const resetPasswordSchema = Joi.object({
    email: Joi.string().trim().max(256).email().required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'string.max': ERROR_CODES.FIELD_MAX,
            'string.email': ERROR_CODES.FIELD_INVALID
        }),
    verificationCode: Joi.string().max(64).pattern(/^\d+$/).required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'string.pattern.base': ERROR_CODES.FIELD_NUMBER_ONLY,
            'string.max': ERROR_CODES.FIELD_MAX
        }),
    password: Joi.string().max(128).required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'string.max': ERROR_CODES.FIELD_MAX
        })
});

const loginSchema = Joi.object({
    email: Joi.string().trim().max(256).email().required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'string.max': ERROR_CODES.FIELD_MAX,
            'string.email': ERROR_CODES.FIELD_INVALID
        }),
    password: Joi.string().max(128).required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'string.max': ERROR_CODES.FIELD_MAX
        }),
    fcmToken: Joi.string().required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED
        })
});

const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().trim().required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED
        })
});

const logoutSchema = Joi.object({
    accessToken: Joi.string().trim().required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED
        }),
    refreshToken: Joi.string().trim().required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED
        }),
    fcmToken: Joi.string().required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED
        })
});

module.exports = {
    registerUserSchema,
    verifyCodeUserSchema,
    sendVerificationCodeSchema,
    resetPasswordSchema,
    loginSchema,
    refreshTokenSchema,
    logoutSchema
};
