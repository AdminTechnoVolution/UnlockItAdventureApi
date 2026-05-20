const Joi = require('joi');
const { ERROR_CODES } = require('../../shared/i18n/messages');

const unlockGroupSchema = Joi.object({
    groupId: Joi.string().trim().required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'any.invalid': ERROR_CODES.FIELD_INVALID,
        }),
    purchaseToken: Joi.string().trim().max(2048).optional()
        .messages({
            'string.max': ERROR_CODES.FIELD_MAX,
        }),
    productId: Joi.string().trim().max(256).optional()
        .messages({
            'string.max': ERROR_CODES.FIELD_MAX,
        }),
});

module.exports = {
    unlockGroupSchema,
};
