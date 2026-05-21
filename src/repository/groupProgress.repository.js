const path = require('path');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const { ERROR_CODES } = require('../../shared/i18n/messages');
const DataLayerException = require('../../shared/commons/models/DataLayerException');
const GroupProgress = require('../models/groupProgress.model');

const find = async (filter, sort, req = null) => {
    try {
        const query = await GroupProgress.find(filter).sort(sort).lean();
        return query;
    } catch (err) {
        logger.error(`Error in find. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

const existsByFilter = async (filter, req = null) => {
    try {
        return await GroupProgress.exists(filter);
    } catch (err) {
        logger.error(`Error in existsByFilter. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

const save = async (groupProgress, req = null) => {
    try {
        return await groupProgress.save();
    } catch (err) {
        logger.error(`Error in save. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

const findById = async (id, req = null) => {
    try {
        return await GroupProgress.findById(id);
    } catch (err) {
        logger.error(`Error in findById. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

module.exports = {
    find,
    existsByFilter,
    save,
    findById,
};
