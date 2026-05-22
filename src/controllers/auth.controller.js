const { ERROR_CODES } = require('../../shared/i18n/messages');
const AuthService = require('../services/auth.service');
const BusinessException = require('../../shared/commons/models/BusinessException');

const socialLogin = async (req, res, next) => {
    try {
        if (!req.body) throw new BusinessException(ERROR_CODES.ERROR_BAD_REQUEST_RESPONSE);

        const jsonResponse = await AuthService.socialLogin(req);
        res.status(200).json(jsonResponse);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    socialLogin,
};
