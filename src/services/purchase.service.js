const path = require('path');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const Purchase = require('../models/purchase.model');
const PurchaseRepository = require('../repository/purchase.repository');
const PurchaseStatus = require('../../shared/constants/enums/EnumPurchaseStatus');
const PurchasePlatform = require('../../shared/constants/enums/EnumPurchasePlatform');
const googlePlayConstants = require('../../shared/constants/googlePlay.constants');
const googlePlay = require('../clients/googlePlay');
const env = require('../../shared/constants/environmentSystemVariables');
const BusinessException = require('../../shared/commons/models/BusinessException');
const constants = require('../../shared/constants/constants');
const { ERROR_CODES } = require('../../shared/i18n/messages');

const assertNoActiveDuplicatePurchase = async (purchaseToken, orderId, req) => {
    const duplicateToken = await PurchaseRepository.existsByFilter({
        purchaseToken,
        status: PurchaseStatus.ACTIVE,
    }, req);

    if (duplicateToken) {
        throw new BusinessException(ERROR_CODES.CODE_GOOGLE_PLAY_VALIDATION_FAILED, constants.HTTP_BAD_REQUEST);
    }

    const duplicateOrder = await PurchaseRepository.existsByFilter({
        orderId,
        status: PurchaseStatus.ACTIVE,
    }, req);

    if (duplicateOrder) {
        throw new BusinessException(ERROR_CODES.CODE_GOOGLE_PLAY_VALIDATION_FAILED, constants.HTTP_BAD_REQUEST);
    }
};

const validateAndRecordGooglePlayPurchase = async ({
    userId,
    groupProgressId,
    group,
    purchaseToken,
    productId,
    priceAmountMicros,
    priceCurrencyCode,
}, req) => {
    if (!purchaseToken || !productId) {
        throw new BusinessException(ERROR_CODES.ERROR_BAD_REQUEST_RESPONSE, constants.HTTP_BAD_REQUEST);
    }

    let purchaseData;

    try {
        purchaseData = await googlePlay.getProductPurchase(productId, purchaseToken, req);
    } catch (error) {
        logger.error({
            message: `Google Play purchase validation failed. groupId=${group._id}, productId=${productId}. Error: ${error.message}`,
            className: filename,
            req,
        });
        throw new BusinessException(ERROR_CODES.CODE_GOOGLE_PLAY_VALIDATION_FAILED, constants.HTTP_BAD_REQUEST);
    }

    if (purchaseData.purchaseState !== googlePlayConstants.PURCHASE_STATE_PURCHASED) {
        logger.warn({
            message: `Google Play purchase not in purchased state. groupId=${group._id}, productId=${productId}, purchaseState=${purchaseData.purchaseState}`,
            className: filename,
            req,
        });
        throw new BusinessException(ERROR_CODES.CODE_GOOGLE_PLAY_VALIDATION_FAILED, constants.HTTP_BAD_REQUEST);
    }

    if (!purchaseData.orderId) {
        throw new BusinessException(ERROR_CODES.CODE_GOOGLE_PLAY_VALIDATION_FAILED, constants.HTTP_BAD_REQUEST);
    }

    await assertNoActiveDuplicatePurchase(purchaseToken, purchaseData.orderId, req);

    const purchase = new Purchase({
        userId,
        groupProgressId,
        groupId: group._id,
        platform: PurchasePlatform.GOOGLE_PLAY,
        packageName: env.GOOGLE_PLAY_PACKAGE_NAME,
        productId,
        purchaseToken,
        orderId: purchaseData.orderId,
        purchaseState: purchaseData.purchaseState,
        consumptionState: purchaseData.consumptionState ?? 0,
        purchaseTimeMillis: Number(purchaseData.purchaseTimeMillis),
        regionCode: purchaseData.regionCode,
        quantity: purchaseData.quantity || 1,
        status: PurchaseStatus.ACTIVE,
        priceAmountMicros,
        priceCurrencyCode,
    });

    await PurchaseRepository.save(purchase, req);

    try {
        await googlePlay.consumeProduct(productId, purchaseToken, req);
        purchase.consumptionState = 1;
        await PurchaseRepository.save(purchase, req);
    } catch (error) {
        purchase.status = PurchaseStatus.FAILED;
        await PurchaseRepository.save(purchase, req);

        logger.error({
            message: `Google Play consume failed after purchase record created. purchaseId=${purchase._id}. Error: ${error.message}`,
            className: filename,
            req,
        });

        throw new BusinessException(ERROR_CODES.CODE_GOOGLE_PLAY_VALIDATION_FAILED, constants.HTTP_BAD_REQUEST);
    }

    return purchase;
};

const markPurchaseRefunded = async (purchaseToken, notificationType, req) => {
    const purchase = await PurchaseRepository.findByPurchaseToken(purchaseToken, req);

    if (!purchase) {
        logger.warn({
            message: `RTDN refund: purchase not found for purchaseToken=${purchaseToken}`,
            className: filename,
            req,
        });
        return null;
    }

    if (purchase.status === PurchaseStatus.REFUNDED) {
        return purchase;
    }

    purchase.status = PurchaseStatus.REFUNDED;
    purchase.refundedAt = new Date();
    purchase.lastRtdnNotificationType = notificationType;

    await PurchaseRepository.save(purchase, req);

    return purchase;
};

module.exports = {
    validateAndRecordGooglePlayPurchase,
    markPurchaseRefunded,
};
