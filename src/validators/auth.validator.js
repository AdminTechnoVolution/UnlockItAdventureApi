const Joi = require('joi');
const { ERROR_CODES } = require('../../shared/i18n/messages');
const AuthType = require('../../shared/constants/enums/EnumAuthType');

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
});

module.exports = {
    socialLoginSchema,
};
