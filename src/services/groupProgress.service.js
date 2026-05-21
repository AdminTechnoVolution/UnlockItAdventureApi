const path = require('path');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const ObjectId = require('mongoose').Types.ObjectId;
const BaseResponse = require('../../shared/commons/models/BaseResponse');
const BusinessException = require('../../shared/commons/models/BusinessException');
const GroupProgress = require('../models/groupProgress.model');
const GroupRepository = require('../repository/group.repository');
const GroupProgressRepository = require('../repository/groupProgress.repository');
const UserRepository = require('../repository/user.repository');
const GroupProgressStatus = require('../../shared/constants/enums/EnumGroupProgressStatus');
const constants = require('../../shared/constants/constants');
const jwt = require('../../shared/util/jwt');
const { SUCCESS_CODES, ERROR_CODES } = require('../../shared/i18n/messages');
const { translate } = require('../../shared/util/util');

const unlockGroup = async (req) => {
    const acceptLanguage = req.acceptLanguage;
    const auth = req.headers['authorization'];
    const { decoded } = jwt.verifyJwtToken(auth, true);

    const { groupId, purchaseToken, productId } = req.body;
    const userId = new ObjectId(decoded.id);

    const group = await validateUnlockEligibility(userId, groupId, req);
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
        await validateGooglePlayPurchase({ group, groupId, purchaseToken, productId }, req);
        saved.status = GroupProgressStatus.IN_PROGRESS;
        saved = await GroupProgressRepository.save(saved, req);
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

    return { groupProgress, uniquePartnerEmails, partnerUsers };
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
    const existingPartnerIds = new Set((groupProgress.partnerId || []).map((id) => id.toString()));
    const newPartnerIds = partnerUsers
        .map((user) => user._id)
        .filter((partnerId) => !existingPartnerIds.has(partnerId.toString()));

    groupProgress.partnerId = [...(groupProgress.partnerId || []), ...newPartnerIds];
};

const isPaidGroup = (group) => {
    return Array.isArray(group.productsId)
        && group.productsId.length > 0
        && group.productsId.some((id) => typeof id === 'string' && id.trim().length > 0);
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

const validateGooglePlayPurchase = async ({ group, groupId, purchaseToken, productId }, req) => {
    if (!purchaseToken || !productId) {
        throw new BusinessException(ERROR_CODES.ERROR_BAD_REQUEST_RESPONSE, constants.HTTP_BAD_REQUEST);
    }

    try {
        // TODO: Validar compra contra Google Play Console (purchaseToken / productId).
        // - Verificar purchaseToken con Google Play Developer API (subscriptions/in-app products).
        // - Confirmar que productId coincide con group.productsId.
        // - Rechazar con BusinessException si el pago no es válido o ya fue consumido.
        // - Si el servicio de google no responde reintentar varias veces antes de fallar.
        // - Si el servicio responde pero no es válido, loggear detalles y eliminar el registro de la DB.
        logger.info({ message: `TODO: Google Play validation pending for groupId=${groupId}, productId=${productId}, productsId=${group.productsId.join(',')}, purchaseTokenReceived=${Boolean(purchaseToken)}`, className: filename, req: req });
    } catch (error) {
        logger.error({ message: `Error validating Google Play purchase for groupId=${groupId}, productId=${productId}. Error: ${error.message}`, className: filename, req: req });
        throw new BusinessException(ERROR_CODES.CODE_GOOGLE_PLAY_VALIDATION_FAILED, constants.HTTP_BAD_REQUEST);
    }
};

const buildInitialActivities = (groupActivities, userId) => {
    if (!groupActivities?.length) return [];

    return groupActivities.map((activity) => ({
        key: activity.key,
        completed: false,
        updatedBy: userId,
    }));
};

module.exports = {
    unlockGroup,
    addPartners,
};
