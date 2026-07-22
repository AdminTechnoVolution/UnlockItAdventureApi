const BaseResponse = require('../commons/models/BaseResponse');
const { translate } = require('../util/util');

function validateBody(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const lang = req.acceptLanguage;
            const messages = error.details.map(detail => {
                return translate(detail.message, lang) + translate(detail.context.key, lang);
            });

            const response = new BaseResponse(false, messages);
            return res.status(400).json(response);
        }

        next();
    };
}

module.exports = validateBody;