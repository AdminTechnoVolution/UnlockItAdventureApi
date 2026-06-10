const path = require('path');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const ObjectId = require('mongoose').Types.ObjectId;
const BaseResponse = require('../../shared/commons/models/BaseResponse');
const BusinessException = require('../../shared/commons/models/BusinessException');
const ClientException = require('../../shared/commons/models/ClientException');
const GroupProgress = require('../models/groupProgress.model');
const GroupRepository = require('../repository/group.repository');
const GroupProgressRepository = require('../repository/groupProgress.repository');
const UserRepository = require('../repository/user.repository');
const GroupProgressStatus = require('../../shared/constants/enums/EnumGroupProgressStatus');
const constants = require('../../shared/constants/constants');
const jwt = require('../../shared/util/jwt');
const AppConfigService = require('./appConfig.service');
const AppConfigKey = require('../../shared/constants/enums/EnumAppConfigKey');
const azureBlobStorage = require('../clients/azureBlob');
const googleCloudVision = require('../clients/googleVision');
const { SUCCESS_CODES, ERROR_CODES } = require('../../shared/i18n/messages');
const { translate, pickLanguage, generateSecureRandom } = require('../../shared/util/util');
const utilPhotoFile = require('../../shared/util/photoFileValidation');
const activityPhotoProcessor = require('../../shared/util/activityPhotoProcessor');
const PurchaseService = require('./purchase.service');

const unlockGroup = async (req) => {
    const acceptLanguage = req.acceptLanguage;
    const auth = req.headers['authorization'];
    const { decoded } = jwt.verifyJwtToken(auth, true);

    const { groupId, purchaseToken, productId, priceAmountMicros, priceCurrencyCode } = req.body;
    const userId = new ObjectId(decoded.id);

    const group = await validateUnlockEligibility(userId, groupId, req);
    validateProductIdBelongsToGroup(group, productId);
    const paidGroup = isPaidGroup(group);
    const activities = buildInitialActivities(group.activities, userId);

    const groupProgress = new GroupProgress({
        userId,
        groupId: group._id,
        partnerId: [],
        status: paidGroup ? GroupProgressStatus.VALIDATING : GroupProgressStatus.IN_PROGRESS,
        activities,
    });

    let saved = await GroupProgressRepository.save(groupProgress, req);

    if (paidGroup) {
        try {
            await PurchaseService.validateAndRecordGooglePlayPurchase({
                userId,
                groupProgressId: saved._id,
                group,
                purchaseToken,
                productId,
                priceAmountMicros,
                priceCurrencyCode,
            }, req);
            saved.status = GroupProgressStatus.IN_PROGRESS;
            saved = await GroupProgressRepository.save(saved, req);
        } catch (error) {
            await deleteGroupProgressWithAzureCleanup(saved._id, req);
            throw error;
        }
    }

    const message = translate(SUCCESS_CODES.CODE_UNLOCK_GROUP_SUCCESS, acceptLanguage);

    return new BaseResponse(true, [message], saved);
};

const addPartners = async (req) => {
    const acceptLanguage = req.acceptLanguage;
    const auth = req.headers['authorization'];
    const { decoded } = jwt.verifyJwtToken(auth, true);

    const { groupProgressId, partnerIds } = req.body;
    const userId = new ObjectId(decoded.id);

    const { groupProgress, partnerUsers } = await validateAddPartnersEligibility(userId, groupProgressId, partnerIds, req);

    appendPartnersToGroupProgress(groupProgress, partnerUsers);

    await GroupProgressRepository.save(groupProgress, req);
    const message = translate(SUCCESS_CODES.CODE_ADD_PARTNERS_SUCCESS, acceptLanguage);

    return new BaseResponse(true, [message]);
};

const validateAddPartnersEligibility = async (userId, groupProgressId, partnerIds, req) => {
    const groupProgress = await GroupProgressRepository.findById(groupProgressId, req);

    if (!groupProgress || groupProgress.status === GroupProgressStatus.VALIDATING) {
        throw new BusinessException(ERROR_CODES.CODE_GROUP_PROGRESS_NOT_FOUND, constants.HTTP_NOT_FOUND);
    }

    if (groupProgress.userId.toString() !== userId.toString()) {
        throw new BusinessException(ERROR_CODES.CODE_GROUP_PROGRESS_FORBIDDEN, constants.HTTP_FORBIDDEN);
    }

    const uniquePartnerEmails = [...new Set(partnerIds.map((email) => email.toLowerCase().trim()))];
    await validatePartnerEmails(userId, uniquePartnerEmails, req);

    const partnerUsers = await UserRepository.findByEmails(uniquePartnerEmails, req);

    if (partnerUsers.length !== uniquePartnerEmails.length) {
        throw new BusinessException(ERROR_CODES.CODE_PARTNER_EMAIL_NOT_FOUND, constants.HTTP_NOT_FOUND);
    }

    await validatePartnersMaxCount(groupProgress, partnerUsers, req);

    return { groupProgress, uniquePartnerEmails, partnerUsers };
};

const getNewPartnerIds = (groupProgress, partnerUsers) => {
    const existingPartnerIds = new Set((groupProgress.partnerId || []).map((id) => id.toString()));

    return partnerUsers
        .map((user) => user._id)
        .filter((partnerId) => !existingPartnerIds.has(partnerId.toString()));
};

const validatePartnersMaxCount = async (groupProgress, partnerUsers, req) => {
    const maxPartnersConfig = await AppConfigService.getConfigByKey(AppConfigKey.GROUP_PARTNERS_MAX_COUNT, req);
    const maxPartners = Number(maxPartnersConfig);
    const newPartnersCount = getNewPartnerIds(groupProgress, partnerUsers).length;
    const totalAfterAdd = (groupProgress.partnerId || []).length + newPartnersCount;

    if (totalAfterAdd > maxPartners) {
        throw new BusinessException(ERROR_CODES.CODE_PARTNERS_MAX_REACHED, constants.HTTP_BAD_REQUEST);
    }
};

const validatePartnerEmails = async (userId, partnerEmails, req) => {
    const owner = await UserRepository.findOneByFilter({ _id: userId }, req);

    if (!owner) {
        throw new BusinessException(ERROR_CODES.CODE_USER_NOT_FOUND, constants.HTTP_NOT_FOUND);
    }

    const ownerEmail = owner.email.toLowerCase();

    if (partnerEmails.some((email) => email === ownerEmail)) {
        throw new BusinessException(ERROR_CODES.CODE_PARTNER_CANNOT_BE_SELF, constants.HTTP_BAD_REQUEST);
    }
};

const appendPartnersToGroupProgress = (groupProgress, partnerUsers) => {
    const newPartnerIds = getNewPartnerIds(groupProgress, partnerUsers);

    groupProgress.partnerId = [...(groupProgress.partnerId || []), ...newPartnerIds];
};

const removePartner = async (req) => {
    const acceptLanguage = req.acceptLanguage;
    const auth = req.headers['authorization'];
    const { decoded } = jwt.verifyJwtToken(auth, true);

    const { groupProgressId, partnerId } = req.body;
    const userId = new ObjectId(decoded.id);
    const partnerObjectId = new ObjectId(partnerId);

    const groupProgress = await validateRemovePartnerEligibility(userId, groupProgressId, partnerObjectId, req);

    removePartnerFromGroupProgress(groupProgress, partnerObjectId);

    await GroupProgressRepository.save(groupProgress, req);
    const message = translate(SUCCESS_CODES.CODE_REMOVE_PARTNER_SUCCESS, acceptLanguage);

    return new BaseResponse(true, [message]);
};

const validateRemovePartnerEligibility = async (userId, groupProgressId, partnerId, req) => {
    const groupProgress = await GroupProgressRepository.findById(groupProgressId, req);

    if (!groupProgress || groupProgress.status === GroupProgressStatus.VALIDATING) {
        throw new BusinessException(ERROR_CODES.CODE_GROUP_PROGRESS_NOT_FOUND, constants.HTTP_NOT_FOUND);
    }

    const isOwner = groupProgress.userId.toString() === userId.toString();
    const partnerExists = (groupProgress.partnerId || []).some((id) => id.toString() === partnerId.toString());

    if (!isOwner && partnerId.toString() !== userId.toString()) {
        throw new BusinessException(ERROR_CODES.CODE_REMOVE_PARTNER_FORBIDDEN, constants.HTTP_FORBIDDEN);
    }

    if (!partnerExists) {
        throw new BusinessException(ERROR_CODES.CODE_PARTNER_NOT_FOUND, constants.HTTP_NOT_FOUND);
    }

    return groupProgress;
};

const removePartnerFromGroupProgress = (groupProgress, partnerId) => {
    groupProgress.partnerId = (groupProgress.partnerId || []).filter(
        (id) => id.toString() !== partnerId.toString()
    );
};

const addActivityPhoto = async (req) => {
    const acceptLanguage = req.acceptLanguage;
    const auth = req.headers['authorization'];
    const { decoded } = jwt.verifyJwtToken(auth, true);
    const userId = new ObjectId(decoded.id);
    const { groupProgressId, keyActivity } = req.body;
    const file = req.file;

    if (!file) {
        throw new BusinessException(ERROR_CODES.CODE_PHOTO_REQUIRED, constants.HTTP_BAD_REQUEST);
    }

    await validateActivityPhotoFile(file, req);

    const groupProgress = await GroupProgressRepository.findById(groupProgressId, req);

    validateActivityPhotoGroupProgress(groupProgress, keyActivity);

    if (!isGroupProgressParticipant(userId, groupProgress)) {
        throw new BusinessException(ERROR_CODES.CODE_GROUP_PROGRESS_UPDATE_FORBIDDEN, constants.HTTP_FORBIDDEN);
    }

    const maxPhotosPerActivity = (await AppConfigService.getConfigByKey(AppConfigKey.ACTIVITY_PHOTOS_MAX_PER_USER, req))?.value ?? 2;
    const activity = groupProgress.activities.find((item) => item.key === keyActivity);
    const activityPhotosCount = (activity.photos || []).length;

    if (activityPhotosCount >= Number(maxPhotosPerActivity)) {
        throw new BusinessException(ERROR_CODES.CODE_ACTIVITY_PHOTOS_MAX_REACHED, constants.HTTP_BAD_REQUEST);
    }

    await googleCloudVision.validateImageContent(file.buffer, req);

    const pathPhotoName = buildActivityPhotoPathName();
    const reservedPhoto = {
        name: pathPhotoName,
        uploadedBy: userId,
    };

    activity.photos.push(reservedPhoto);
    activity.updatedBy = userId;
    groupProgress.markModified('activities');

    await GroupProgressRepository.save(groupProgress, req);

    const photoIndex = activity.photos.length - 1;

    try {
        const variantsBuffers = await activityPhotoProcessor.processActivityPhotoVariants(file.buffer, req);
        const urlsBySize = await azureBlobStorage.uploadActivityPhotoVariants(
            groupProgressId,
            keyActivity,
            pathPhotoName,
            variantsBuffers,
            req,
        );

        activity.photos[photoIndex].sizes = Object.entries(urlsBySize).map(([size, url]) => ({ size, url }));
        activity.photos[photoIndex].uploadedAt = new Date();
        groupProgress.markModified('activities');

        await GroupProgressRepository.save(groupProgress, req);
    } catch (error) {
        await azureBlobStorage.deleteActivityPhotoFolder(groupProgressId, keyActivity, pathPhotoName, req);
        activity.photos.splice(photoIndex, 1);
        groupProgress.markModified('activities');
        await GroupProgressRepository.save(groupProgress, req);
        throw error;
    }

    const message = translate(SUCCESS_CODES.CODE_ACTIVITY_PHOTO_UPLOAD_SUCCESS, acceptLanguage);

    const data = { photo: mapActivityPhoto(activity.photos[photoIndex]) };
    return new BaseResponse(true, [message], data);
};

const buildActivityPhotoPathName = () => {
    const randomSuffix = String(generateSecureRandom(0, 9999)).padStart(4, '0');

    return `${Date.now()}_${randomSuffix}`;
};

const removeActivityPhoto = async (req) => {
    const acceptLanguage = req.acceptLanguage;
    const auth = req.headers['authorization'];
    const { decoded } = jwt.verifyJwtToken(auth, true);
    const userId = new ObjectId(decoded.id);
    const { groupProgressId, keyActivity, name } = req.body;

    const groupProgress = await GroupProgressRepository.findById(groupProgressId, req);

    if (!groupProgress || groupProgress.status !== GroupProgressStatus.IN_PROGRESS) {
        throw new BusinessException(ERROR_CODES.CODE_GROUP_PROGRESS_NOT_FOUND, constants.HTTP_NOT_FOUND);
    }

    if (!isGroupProgressParticipant(userId, groupProgress)) {
        throw new BusinessException(ERROR_CODES.CODE_GROUP_PROGRESS_UPDATE_FORBIDDEN, constants.HTTP_FORBIDDEN);
    }

    validateActivityPhotoGroupProgress(groupProgress, keyActivity);

    const activity = groupProgress.activities.find((item) => item.key === keyActivity);
    const photoIndex = findActivityPhotoIndexByName(activity, name);

    if (photoIndex === -1) {
        throw new BusinessException(ERROR_CODES.CODE_ACTIVITY_PHOTO_NOT_FOUND, constants.HTTP_NOT_FOUND);
    }

    await azureBlobStorage.deleteActivityPhotoFolder(groupProgressId, keyActivity, name, req);

    activity.photos.splice(photoIndex, 1);
    activity.updatedBy = userId;
    groupProgress.markModified('activities');

    await GroupProgressRepository.save(groupProgress, req);

    const message = translate(SUCCESS_CODES.CODE_PHOTO_DELETE_SUCCESS, acceptLanguage);

    return new BaseResponse(true, [message]);
};

const findActivityPhotoIndexByName = (activity, name) => {
    return (activity.photos || []).findIndex((photo) => photo.name === name);
};

const validateActivityPhotoGroupProgress = (groupProgress, keyActivity) => {
    if (!groupProgress || groupProgress.status !== GroupProgressStatus.IN_PROGRESS) {
        throw new BusinessException(ERROR_CODES.CODE_GROUP_PROGRESS_NOT_FOUND, constants.HTTP_NOT_FOUND);
    }

    const activityExists = (groupProgress.activities || []).some((activity) => activity.key === keyActivity);

    if (!activityExists) {
        throw new BusinessException(ERROR_CODES.CODE_GROUP_PROGRESS_ACTIVITY_NOT_FOUND, constants.HTTP_NOT_FOUND);
    }
};

const validateActivityPhotoFile = async (file, req) => {
    await utilPhotoFile.validatePhotoFile(file, req, {
        maxFileSizeMbConfigKey: AppConfigKey.ACTIVITY_PHOTO_MAX_FILE_SIZE_MB,
    });
};

const updateGroupProgress = async (req) => {
    const acceptLanguage = req.acceptLanguage;
    const auth = req.headers['authorization'];
    const { decoded } = jwt.verifyJwtToken(auth, true);
    const userId = new ObjectId(decoded.id);

    const { groupProgressId, keyActivity, completed, activityCompletedAt, groupCompletedAt, notes } = req.body;

    const groupProgress = await validateUpdateGroupProgressEligibility(userId, groupProgressId, keyActivity, req);

    fillGroupProgressActivity(groupProgress, { keyActivity, completed, activityCompletedAt, notes, userId, });

    fillGroupProgress(groupProgress, groupCompletedAt);

    await GroupProgressRepository.save(groupProgress, req);
    const message = translate(SUCCESS_CODES.CODE_UPDATE_GROUP_PROGRESS_SUCCESS, acceptLanguage);

    return new BaseResponse(true, [message]);
};

const validateUpdateGroupProgressEligibility = async (userId, groupProgressId, keyActivity, req) => {
    const groupProgress = await GroupProgressRepository.findById(groupProgressId, req);

    if (!groupProgress || groupProgress.status === GroupProgressStatus.VALIDATING) {
        throw new BusinessException(ERROR_CODES.CODE_GROUP_PROGRESS_NOT_FOUND, constants.HTTP_NOT_FOUND);
    }

    if (!isGroupProgressParticipant(userId, groupProgress)) {
        throw new BusinessException(ERROR_CODES.CODE_GROUP_PROGRESS_UPDATE_FORBIDDEN, constants.HTTP_FORBIDDEN);
    }

    const activityExists = (groupProgress.activities || []).some((activity) => activity.key === keyActivity);

    if (!activityExists) {
        throw new BusinessException(ERROR_CODES.CODE_GROUP_PROGRESS_ACTIVITY_NOT_FOUND, constants.HTTP_NOT_FOUND);
    }

    return groupProgress;
};

const isGroupProgressParticipant = (userId, groupProgress) => {
    const userIdStr = userId.toString();

    if (groupProgress.userId.toString() === userIdStr) {
        return true;
    }

    return (groupProgress.partnerId || []).some((partnerId) => partnerId.toString() === userIdStr);
};

const fillGroupProgressActivity = (groupProgress, { keyActivity, completed, activityCompletedAt, notes, userId }) => {
    const activity = groupProgress.activities.find((item) => item.key === keyActivity);

    if (completed !== undefined) {
        activity.completed = completed;
    }

    if (activityCompletedAt !== undefined) {
        activity.completedAt = activityCompletedAt;
    }

    if (notes !== undefined) {
        activity.notes = notes;
    }

    activity.updatedBy = userId;
    groupProgress.markModified('activities');
};

const fillGroupProgress = (groupProgress, groupCompletedAt) => {
    if (groupCompletedAt !== undefined && groupCompletedAt !== '') {
        groupProgress.completedAt = groupCompletedAt;
    }

    const allCompleted = (groupProgress.activities || []).length > 0
        && groupProgress.activities.every((activity) => activity.completed === true);

    if (allCompleted) {
        if (groupProgress.status !== GroupProgressStatus.COMPLETED) {
            groupProgress.status = GroupProgressStatus.COMPLETED;
        }
    } else {
        groupProgress.status = GroupProgressStatus.IN_PROGRESS;
    }
};

const isPaidGroup = (group) => {
    return Array.isArray(group.productsId)
        && group.productsId.length > 0
        && group.productsId.some((id) => typeof id === 'string' && id.trim().length > 0);
};

const validateProductIdBelongsToGroup = (group, productId) => {
    if (productId === undefined || productId === null) {
        return;
    }

    const allowedProductIds = (group.productsId || [])
        .filter((id) => typeof id === 'string')
        .map((id) => id.trim());

    const isAllowed = allowedProductIds.some((id) => id === productId);

    if (!isAllowed) {
        throw new BusinessException(ERROR_CODES.CODE_PRODUCT_ID_NOT_IN_GROUP, constants.HTTP_BAD_REQUEST);
    }
};

const validateUnlockEligibility = async (userId, groupId, req) => {
    const group = await GroupRepository.findById(groupId, req);

    if (!group || !group.isActive) {
        throw new BusinessException(ERROR_CODES.CODE_GROUP_NOT_ACTIVE, constants.HTTP_NOT_FOUND);
    }

    const alreadyUnlocked = await GroupProgressRepository.existsByFilter({
        userId,
        groupId: group._id,
    }, req);

    if (alreadyUnlocked) {
        throw new BusinessException(ERROR_CODES.CODE_GROUP_ALREADY_UNLOCKED, constants.HTTP_CONFLICT);
    }

    return group;
};

const deleteActivityPhotosFromGroupProgressDoc = async (groupProgress, req) => {
    const groupProgressId = groupProgress._id.toString();

    for (const activity of groupProgress.activities || []) {
        for (const photo of activity.photos || []) {
            if (!photo.name) {
                continue;
            }

            try {
                await azureBlobStorage.deleteActivityPhotoFolder(groupProgressId, activity.key, photo.name, req);
            } catch (error) {
                logger.error({
                    message: `Failed to delete activity photo. groupProgressId=${groupProgressId}, keyActivity=${activity.key}, photoName=${photo.name}. Error: ${error.message}`,
                    className: filename,
                    req,
                });
            }
        }
    }
};

const deleteGroupProgressWithAzureCleanup = async (groupProgressId, req) => {
    const groupProgress = await GroupProgressRepository.findById(groupProgressId, req);

    if (!groupProgress) {
        return;
    }

    const leanDoc = groupProgress.toObject ? groupProgress.toObject() : groupProgress;
    await deleteActivityPhotosFromGroupProgressDoc(leanDoc, req);
    await GroupProgressRepository.deleteById(groupProgressId, req);
};

const buildInitialActivities = (groupActivities, userId) => {
    if (!groupActivities?.length) return [];

    return groupActivities.map((activity) => ({
        key: activity.key,
        completed: false,
        updatedBy: userId,
    }));
};

const getGroupProgressList = async (req, fetchGroupProgressList) => {
    const acceptLanguage = req.acceptLanguage;
    const auth = req.headers['authorization'];
    const { decoded } = jwt.verifyJwtToken(auth, true);
    const userId = new ObjectId(decoded.id);

    const groupProgressList = await fetchGroupProgressList(userId, req);
    const data = groupProgressList.map((groupProgress) => mapGroupProgressResponse(groupProgress, acceptLanguage));

    return new BaseResponse(true, [], data);
};

const getMyGroupProgress = async (req) => getGroupProgressList(req, GroupProgressRepository.findByUserIdWithRelations);

const getSharedGroupProgress = async (req) => getGroupProgressList(req, GroupProgressRepository.findByPartnerIdWithRelations);

const mapGroupProgressResponse = (groupProgress, lang) => {
    const groupActivitiesByKey = buildGroupActivitiesByKey(groupProgress.group?.activities, lang);

    return {
        id: groupProgress._id,
        status: groupProgress.status,
        completedAt: groupProgress.completedAt,
        createdAt: groupProgress.createdAt,
        updatedAt: groupProgress.updatedAt,
        userId: mapUserSummary(groupProgress.owner),
        group: groupProgress.group ? mapGroupSummary(groupProgress.group, lang) : null,
        partners: mapPartners(groupProgress.partnerId, groupProgress.partners),
        activities: (groupProgress.activities || []).map((progressActivity) => mapProgressActivity(
            progressActivity,
            groupActivitiesByKey.get(progressActivity.key)
        )),
    };
};

const mapGroupSummary = (group, lang) => ({
    id: group._id,
    name: pickLanguage(group.name, lang),
    description: pickLanguage(group.description, lang),
    imageUrl: group.imageUrl,
    tags: pickLanguage(group.tags, lang),
    additionalInfo: pickLanguage(group.additionalInfo, lang),
    createdAt: group.createdAt,
});

const buildGroupActivitiesByKey = (activities, lang) => {
    const activitiesByKey = new Map();

    if (!activities?.length) return activitiesByKey;

    activities.forEach((activity) => {
        activitiesByKey.set(activity.key, mapGroupActivity(activity, lang));
    });

    return activitiesByKey;
};

const mapGroupActivity = (activity, lang) => ({
    name: pickLanguage(activity.name, lang),
    description: pickLanguage(activity.description, lang),
    tips: pickLanguage(activity.tips, lang),
    imageUrl: activity.imageUrl,
    additionalInfo: pickLanguage(activity.additionalInfo, lang),
    tags: pickLanguage(activity.tags, lang),
    difficulty: activity.difficulty,
});

const mapActivityPhoto = (photo) => ({
    name: photo.name ?? null,
    sizes: (photo.sizes || []).map(({ size, url }) => ({ size, url })),
    uploadedAt: photo.uploadedAt ?? null,
    uploadedBy: photo.uploadedBy ?? null,
});

const mapProgressActivity = (progressActivity, groupActivity = {}) => ({
    key: progressActivity.key,
    completed: progressActivity.completed,
    completedAt: progressActivity.completedAt,
    notes: progressActivity.notes,
    photos: (progressActivity.photos || [])
        .filter((photo) => (photo.sizes || []).some((sizeItem) => sizeItem.url))
        .map(mapActivityPhoto),
    updatedBy: progressActivity.updatedBy,
    name: groupActivity.name ?? null,
    description: groupActivity.description ?? null,
    tips: groupActivity.tips ?? null,
    imageUrl: groupActivity.imageUrl ?? null,
    additionalInfo: groupActivity.additionalInfo ?? null,
    tags: groupActivity.tags ?? null,
    difficulty: groupActivity.difficulty ?? null,
});

const mapUserSummary = (user) => {
    if (!user) return null;

    return {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
    };
};

const mapPartners = (partnerIds, partners) => {
    const partnerMap = new Map((partners || []).map((partner) => [partner._id.toString(), partner]));

    return (partnerIds || [])
        .map((partnerId) => partnerMap.get(partnerId.toString()))
        .filter(Boolean)
        .map(mapUserSummary);
};

module.exports = {
    unlockGroup,
    addPartners,
    removePartner,
    updateGroupProgress,
    addActivityPhoto,
    removeActivityPhoto,
    getMyGroupProgress,
    getSharedGroupProgress,
    deleteGroupProgressWithAzureCleanup,
};
