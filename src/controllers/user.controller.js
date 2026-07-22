const { ERROR_CODES } = require('../../shared/i18n/messages');
const UserService = require('../services/user.service');
const BusinessException = require('../../shared/commons/models/BusinessException');

const updateProfile = async (req, res, next) => {
    try {
        if (!req.body) throw new BusinessException(ERROR_CODES.ERROR_BAD_REQUEST_RESPONSE);

        const jsonResponse = await UserService.updateProfile(req);
        res.status(200).json(jsonResponse);
    } catch (err) {
        next(err);
    }
};

const updateProfilePhoto = async (req, res, next) => {
    try {
        const jsonResponse = await UserService.updateProfilePhoto(req);
        res.status(200).json(jsonResponse);
    } catch (err) {
        next(err);
    }
};

const deleteAccount = async (req, res, next) => {
    try {
        const jsonResponse = await UserService.deleteAccount(req);
        res.status(200).json(jsonResponse);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    updateProfile,
    updateProfilePhoto,
    deleteAccount,
};
