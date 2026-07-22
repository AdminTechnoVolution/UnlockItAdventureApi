const path = require('path');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const env = require('../../shared/constants/environmentSystemVariables');
const googlePlayConstants = require('../../shared/constants/googlePlay.constants');
const PurchaseService = require('./purchase.service');
const GroupProgressService = require('./groupProgress.service');

const processRtdnMessage = async (req) => {
    const message = req.body?.message;

    if (!message?.data) {
        logger.warn({ message: 'RTDN received without message.data', className: filename, req });
        return;
    }

    const decoded = Buffer.from(message.data, 'base64').toString('utf8');
    let notification;

    try {
        notification = JSON.parse(decoded);
    } catch (error) {
        logger.error({
            message: `RTDN failed to parse message.data JSON. Error: ${error.message}`,
            className: filename,
            req,
        });
        return;
    }

    logPackageNameMismatch(notification.packageName, req);

    if (notification.voidedPurchaseNotification) {
        await handleVoidedPurchaseNotification(notification.voidedPurchaseNotification, req);
        return;
    }

    if (notification.oneTimeProductNotification) {
        await handleOneTimeProductNotification(notification.oneTimeProductNotification, req);
        return;
    }

    logger.info({
        message: `RTDN notification ignored (unsupported type). packageName=${notification.packageName}`,
        className: filename,
        req,
    });
};

const logPackageNameMismatch = (packageName, req) => {
    if (!packageName || !env.GOOGLE_PLAY_PACKAGE_NAME) {
        return;
    }

    if (packageName !== env.GOOGLE_PLAY_PACKAGE_NAME) {
        logger.warn({
            message: `RTDN packageName mismatch. received=${packageName}, expected=${env.GOOGLE_PLAY_PACKAGE_NAME}`,
            className: filename,
            req,
        });
    }
};

const processPurchaseRefund = async ({ purchaseToken, orderId, notificationType }, req) => {
    const purchase = await PurchaseService.markPurchaseRefunded({
        purchaseToken,
        orderId,
        notificationType,
    }, req);

    if (purchase?.groupProgressId) {
        await GroupProgressService.deleteGroupProgressWithAzureCleanup(purchase.groupProgressId, req);
    }

    return purchase;
};

const handleVoidedPurchaseNotification = async (voidedNotification, req) => {
    const { purchaseToken, orderId, productType, refundType } = voidedNotification;

    if (productType !== googlePlayConstants.VOIDED_PRODUCT_TYPE_ONE_TIME) {
        logger.info({
            message: `RTDN voided purchase ignored (not one-time). productType=${productType}, orderId=${orderId}`,
            className: filename,
            req,
        });
        return;
    }

    logger.info({
        message: `RTDN voided one-time purchase. orderId=${orderId}, refundType=${refundType}`,
        className: filename,
        req,
    });

    await processPurchaseRefund({
        purchaseToken,
        orderId,
        notificationType: googlePlayConstants.RTDN_VOIDED_PURCHASE_NOTIFICATION,
    }, req);
};

const handleOneTimeProductNotification = async (oneTimeNotification, req) => {
    const { notificationType, purchaseToken, sku } = oneTimeNotification;

    if (notificationType === googlePlayConstants.RTDN_ONE_TIME_PRODUCT_PURCHASED) {
        logger.info({
            message: `RTDN one-time product purchased (unlock already validated). sku=${sku}, purchaseToken=${purchaseToken}`,
            className: filename,
            req,
        });
        return;
    }

    if (notificationType === googlePlayConstants.RTDN_ONE_TIME_PRODUCT_CANCELED) {
        await processPurchaseRefund({
            purchaseToken,
            orderId: null,
            notificationType,
        }, req);
        return;
    }

    logger.info({
        message: `RTDN one-time product notification type ignored. type=${notificationType}, sku=${sku}`,
        className: filename,
        req,
    });
};

module.exports = {
    processRtdnMessage,
};
