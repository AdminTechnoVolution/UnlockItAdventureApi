const { ERROR_CODES } = require('../../shared/i18n/messages');
const GroupProgressService = require('../services/groupProgress.service');
const BusinessException = require('../../shared/commons/models/BusinessException');

const unlockGroup = async (req, res, next) => {
    try {
        if (!req.body) throw new BusinessException(ERROR_CODES.ERROR_BAD_REQUEST_RESPONSE);

        const jsonResponse = await GroupProgressService.unlockGroup(req);
        res.status(200).json(jsonResponse);
    } catch (err) {
        next(err);
    }
};

const addPartners = async (req, res, next) => {
    try {
        if (!req.body) throw new BusinessException(ERROR_CODES.ERROR_BAD_REQUEST_RESPONSE);

        const jsonResponse = await GroupProgressService.addPartners(req);
        res.status(200).json(jsonResponse);
    } catch (err) {
        next(err);
    }
};

const removePartner = async (req, res, next) => {
    try {
        if (!req.body) throw new BusinessException(ERROR_CODES.ERROR_BAD_REQUEST_RESPONSE);

        const jsonResponse = await GroupProgressService.removePartner(req);
        res.status(200).json(jsonResponse);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    unlockGroup,
    addPartners,
    removePartner,
};
