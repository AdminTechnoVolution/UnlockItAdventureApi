const Joi = require('joi');
const { ERROR_CODES } = require('../../shared/i18n/messages');
const Platforms = require('../../shared/constants/enums/EnumPlatforms');

const registerUserSchema = Joi.object({
    email: Joi.string().trim().max(256).email().required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'string.max': ERROR_CODES.FIELD_MAX,
            'string.email': ERROR_CODES.FIELD_INVALID
        }),
    password: Joi.string().min(8).max(128).required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'string.min': ERROR_CODES.FIELD_MIN,
            'string.max': ERROR_CODES.FIELD_MAX
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
    device: {
        fcmToken: Joi.string().required()
            .messages({
                'any.required': ERROR_CODES.FIELD_REQUIRED,
                'string.empty': ERROR_CODES.FIELD_REQUIRED
            }),
        platform: Joi.string().valid(...Object.values(Platforms)).required()
            .messages({
                'any.required': ERROR_CODES.FIELD_REQUIRED,
                'string.empty': ERROR_CODES.FIELD_REQUIRED,
                'any.only': ERROR_CODES.FIELD_INVALID
            }),
        appVersion: Joi.string().max(32).optional()
            .messages({
                'string.max': ERROR_CODES.FIELD_MAX
            }),
        deviceId: Joi.string().max(128).optional()
            .messages({
                'string.max': ERROR_CODES.FIELD_MAX
            })
    }
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
