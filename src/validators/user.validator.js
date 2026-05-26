const Joi = require('joi');
const { ERROR_CODES } = require('../../shared/i18n/messages');

const updateProfileSchema = Joi.object({
    fullName: Joi.string().trim().min(1).max(128).optional()
        .messages({
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'string.min': ERROR_CODES.FIELD_MIN,
            'string.max': ERROR_CODES.FIELD_MAX,
        }),
    username: Joi.string().trim().min(3).max(64).pattern(/^[a-zA-Z0-9_]+$/).optional()
        .messages({
            'string.empty': ERROR_CODES.FIELD_REQUIRED,
            'string.min': ERROR_CODES.FIELD_MIN,
            'string.max': ERROR_CODES.FIELD_MAX,
            'string.pattern.base': ERROR_CODES.FIELD_PATTERN,
        }),
}).or('fullName', 'username')
    .messages({
        'object.missing': ERROR_CODES.FIELD_REQUIRED,
    });

module.exports = {
    updateProfileSchema,
};
