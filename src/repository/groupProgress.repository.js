const path = require('path');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const { ERROR_CODES } = require('../../shared/i18n/messages');
const DataLayerException = require('../../shared/commons/models/DataLayerException');
const GroupProgress = require('../models/groupProgress.model');

const find = async (filter, sort, req = null) => {
    try {
        return await GroupProgress.find(filter).sort(sort).lean();
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

const findOneByFilter = async (filter, req = null) => {
    try {
        return await GroupProgress.findOne(filter);
    } catch (err) {
        logger.error(`Error in findOneByFilter. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

const buildGroupProgressWithRelationsPipeline = (match) => ([
    { $match: match },
    { $sort: { createdAt: -1 } },
    {
        $lookup: {
            from: 'groups',
            localField: 'groupId',
            foreignField: '_id',
            as: 'group',
        },
    },
    { $unwind: { path: '$group', preserveNullAndEmptyArrays: true } },
    {
        $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'owner',
            pipeline: [
                { $project: { fullName: 1, email: 1 } },
            ],
        },
    },
    { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
    {
        $lookup: {
            from: 'users',
            localField: 'partnerId',
            foreignField: '_id',
            as: 'partners',
            pipeline: [
                { $project: { fullName: 1, email: 1 } },
            ],
        },
    },
]);

const findWithRelations = async (match, req = null) => {
    try {
        return await GroupProgress.aggregate(buildGroupProgressWithRelationsPipeline(match));
    } catch (err) {
        logger.error(`Error in findWithRelations. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

const findByUserIdWithRelations = async (userId, req = null) => findWithRelations({ userId }, req);

const findByPartnerIdWithRelations = async (partnerId, req = null) => findWithRelations({ partnerId }, req);

const findByUserId = async (userId, req = null) => {
    try {
        return await GroupProgress.find({ userId }).lean();
    } catch (err) {
        logger.error(`Error in findByUserId. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

const deleteManyByUserId = async (userId, req = null) => {
    try {
        return await GroupProgress.deleteMany({ userId });
    } catch (err) {
        logger.error(`Error in deleteManyByUserId. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

const findForeignWithPhotosByUploader = async (userId, req = null) => {
    try {
        return await GroupProgress.find({
            userId: { $ne: userId },
            $or: [
                { partnerId: userId },
                { 'activities.photos.uploadedBy': userId },
            ],
        });
    } catch (err) {
        logger.error(`Error in findForeignWithPhotosByUploader. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

const pullPartnerFromAll = async (userId, req = null) => {
    try {
        return await GroupProgress.updateMany(
            { partnerId: userId },
            { $pull: { partnerId: userId } },
        );
    } catch (err) {
        logger.error(`Error in pullPartnerFromAll. Error: ${err}`, { className: filename, req: req });
        throw new DataLayerException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR);
    }
};

module.exports = {
    find,
    existsByFilter,
    save,
    findById,
    findOneByFilter,
    findByUserIdWithRelations,
    findByPartnerIdWithRelations,
    findByUserId,
    deleteManyByUserId,
    findForeignWithPhotosByUploader,
    pullPartnerFromAll,
};
