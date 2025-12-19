const path = require('path');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const { ERROR_CODES } = require('../../shared/i18n/messages');
const DataLayerException = require('../../shared/commons/models/DataLayerException');
const FCMToken = require('../models/fcmToken.model');

const findOneByFilter = async (filter) => {
    try {
        return await FCMToken.findOne(filter);
    } catch (err) {
        logger.error(`Error in findOneByFilter. Error: ${err}`, { className: filename });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
}

const findOneByFilterAndPullToken = async (filter, pull) => {
    try {
        return await FCMToken.updateOne(
            filter,
            { $pull: pull }
        );
    } catch (err) {
        logger.error(`Error in findOneByFilterAndPullToken. Error: ${err}`, { className: filename });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
}

const deleteAllByFilter = async (filter) => {
    try {
        return await FCMToken.deleteMany(filter);
    } catch (err) {
        logger.error(`Error in deleteAllByFilter. Error: ${err}`, { className: filename });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
}

const save = async (fcmToken) => {
    try {
        return await fcmToken.save();
    } catch (err) {
        logger.error(`Error in save. Error: ${err}`, { className: filename });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    findOneByFilter,
    findOneByFilterAndPullToken,
    save,
    deleteAllByFilter
};