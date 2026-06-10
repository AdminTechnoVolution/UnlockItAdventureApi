const path = require('path');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
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

    if (notification.oneTimeProductNotification) {
        await handleOneTimeProductNotification(notification.oneTimeProductNotification, req);
        return;
    }

    logger.info({
        message: `RTDN notification ignored (no oneTimeProductNotification). packageName=${notification.packageName}`,
        className: filename,
        req,
    });
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
        const purchase = await PurchaseService.markPurchaseRefunded(purchaseToken, notificationType, req);

        if (purchase?.groupProgressId) {
            await GroupProgressService.deleteGroupProgressWithAzureCleanup(purchase.groupProgressId, req);
        }

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
