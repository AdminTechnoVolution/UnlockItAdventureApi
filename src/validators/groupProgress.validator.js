const Joi = require('joi');
const { ObjectId } = require('mongoose').Types;
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

const addPartnersSchema = Joi.object({
    groupProgressId: Joi.string().trim().required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'any.invalid': ERROR_CODES.FIELD_INVALID,
        }),
    partnerIds: Joi.array()
        .items(
            Joi.string().trim().max(256).email().required()
                .messages({
                    'any.required': ERROR_CODES.FIELD_REQUIRED,
                    'string.empty': ERROR_CODES.FIELD_REQUIRED,
                    'string.max': ERROR_CODES.FIELD_MAX,
                    'string.email': ERROR_CODES.FIELD_INVALID,
                })
        )
        .min(1)
        .required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'array.min': ERROR_CODES.FIELD_REQUIRED,
        }),
});

const removePartnerSchema = Joi.object({
    groupProgressId: Joi.string().trim().required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'any.invalid': ERROR_CODES.FIELD_INVALID,
        }),
    partnerId: Joi.string().trim().required()
        .messages({
            'any.required': ERROR_CODES.FIELD_REQUIRED,
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'any.invalid': ERROR_CODES.FIELD_INVALID,
        }),
});

module.exports = {
    unlockGroupSchema,
    addPartnersSchema,
    removePartnerSchema,
};
