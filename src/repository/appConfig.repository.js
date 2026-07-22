const path = require('path');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const { ERROR_CODES } = require('../../shared/i18n/messages');
const DataLayerException = require('../../shared/commons/models/DataLayerException');
const AppConfig = require('../models/appConfig.model');

const findAll = async (filter = {}, sort = { key: 1 }, req = null) => {
    try {
        return await AppConfig.find(filter).sort(sort).lean();
    } catch (err) {
        logger.error(`Error in findAll. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

const findByKey = async (key, req = null) => {
    try {
        return await AppConfig.findOne({ key }).lean();
    } catch (err) {
        logger.error(`Error in findByKey. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

module.exports = {
    findAll,
    findByKey,
};
