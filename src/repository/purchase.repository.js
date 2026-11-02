const path = require('path');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const { ERROR_CODES } = require('../../shared/i18n/messages');
const DataLayerException = require('../../shared/commons/models/DataLayerException');
const Purchase = require('../models/purchase.model');
const PurchaseStatus = require('../../shared/constants/enums/EnumPurchaseStatus');

const findByPurchaseToken = async (purchaseToken, req = null) => {
    try {
        return await Purchase.findOne({ purchaseToken });
    } catch (err) {
        logger.error(`Error in findByPurchaseToken. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

const findOneByFilter = async (filter, req = null) => {
    try {
        return await Purchase.findOne(filter);
    } catch (err) {
        logger.error(`Error in findOneByFilter. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

const existsByFilter = async (filter, req = null) => {
    try {
        return await Purchase.exists(filter);
    } catch (err) {
        logger.error(`Error in existsByFilter. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

const save = async (purchase, req = null) => {
    try {
        return await purchase.save();
    } catch (err) {
        logger.error(`Error in save. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

const countActivePurchasesByGroupIds = async (groupIds, req = null) => {
    try {
        if (!groupIds.length) {
            return new Map();
        }

        const rows = await Purchase.aggregate([
            {
                $match: {
                    groupId: { $in: groupIds },
                    status: PurchaseStatus.ACTIVE,
                },
            },
            { $group: { _id: '$groupId', count: { $sum: 1 } } },
        ]);

        return new Map(rows.map((row) => [row._id.toString(), row.count]));
    } catch (err) {
        logger.error(`Error in countActivePurchasesByGroupIds. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

const deleteManyByUserId = async (userId, req = null) => {
    try {
        return await Purchase.deleteMany({ userId });
    } catch (err) {
        logger.error(`Error in deleteManyByUserId. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

module.exports = {
    findByPurchaseToken,
    findOneByFilter,
    existsByFilter,
    save,
    countActivePurchasesByGroupIds,
    deleteManyByUserId,
};
