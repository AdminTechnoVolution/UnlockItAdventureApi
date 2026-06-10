const path = require('path');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const { ERROR_CODES } = require('../../shared/i18n/messages');
const DataLayerException = require('../../shared/commons/models/DataLayerException');
const User = require('../models/user.model');
const UserStatus = require('../../shared/constants/enums/EnumUserStatus');

const findOneByFilter = async (filter, req = null) => {
    try {
        return await User.findOne(filter).collation({ locale: 'en', strength: 2 });
    } catch (err) {
        logger.error(`Error in findOneByFilter. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

const existsByFilter = async (filter, req = null) => {
    try {
        return await User.exists(filter);
    } catch (err) {
        logger.error(`Error in existsByFilter. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

const save = async (user, req = null) => {
    try {
        return await user.save();
    } catch (err) {
        logger.error(`Error in save. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

const deleteById = async (userId, req = null) => {
    try {
        return await User.deleteOne({ _id: userId });
    } catch (err) {
        logger.error(`Error in deleteById. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

const findByEmails = async (emails, req = null) => {
    try {
        const normalizedEmails = emails.map((email) => email.toLowerCase().trim());
        return await User.find({ email: { $in: normalizedEmails }, status: UserStatus.ACTIVE })
            .collation({ locale: 'en', strength: 2 });
    } catch (err) {
        logger.error(`Error in findByEmails. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

module.exports = {
    findOneByFilter,
    save,
    existsByFilter,
    findByEmails,
    deleteById,
};
