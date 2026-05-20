const path = require('path');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const ObjectId = require('mongoose').Types.ObjectId;
const BaseResponse = require('../../shared/commons/models/BaseResponse');
const BusinessException = require('../../shared/commons/models/BusinessException');
const GroupProgress = require('../models/groupProgress.model');
const GroupRepository = require('../repository/group.repository');
const GroupProgressRepository = require('../repository/groupProgress.repository');
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

    const group = await validateUnlockEligibility(userId, groupId);
    const paidGroup = isPaidGroup(group);
    const activities = buildInitialActivities(group.activities, userId);

    const groupProgress = new GroupProgress({
        userId,
        groupId: group._id,
        partnerId: [],
        status: paidGroup ? GroupProgressStatus.VALIDATING : GroupProgressStatus.IN_PROGRESS,
        activities,
    });

    let saved = await GroupProgressRepository.save(groupProgress);

    if (paidGroup) {
        await validateGooglePlayPurchase({ group, groupId, purchaseToken, productId }, req);
        saved.status = GroupProgressStatus.IN_PROGRESS;
        saved = await GroupProgressRepository.save(saved);
    }

    const message = translate(SUCCESS_CODES.CODE_UNLOCK_GROUP_SUCCESS, acceptLanguage);

    return new BaseResponse(true, [message], saved);
};

const isPaidGroup = (group) => {
    return Array.isArray(group.productsId)
        && group.productsId.length > 0
        && group.productsId.some((id) => typeof id === 'string' && id.trim().length > 0);
};

const validateUnlockEligibility = async (userId, groupId) => {
    const group = await GroupRepository.findById(groupId);

    if (!group || !group.isActive) {
        throw new BusinessException(ERROR_CODES.CODE_GROUP_NOT_ACTIVE, constants.HTTP_NOT_FOUND);
    }

    const alreadyUnlocked = await GroupProgressRepository.existsByFilter({
        userId,
        groupId: group._id,
    });

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
        logger.info({ message: `TODO: Google Play validation pending for groupId=${groupId}, productId=${productId}, productsId=${group.productsId.join(',')}, purchaseTokenReceived=${Boolean(purchaseToken)}`, className: filename, req, });
    } catch (error) {
        logger.error({ message: `Error validating Google Play purchase for groupId=${groupId}, productId=${productId}. Error: ${error.message}`, className: filename, req });
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
};
