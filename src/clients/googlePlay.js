const path = require('path');
const { google } = require('googleapis');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const env = require('../../shared/constants/environmentSystemVariables');
const constants = require('../../shared/constants/constants');
const googlePlayConstants = require('../../shared/constants/googlePlay.constants');
const BusinessException = require('../../shared/commons/models/BusinessException');
const { ERROR_CODES } = require('../../shared/i18n/messages');

const ANDROID_PUBLISHER_SCOPE = 'https://www.googleapis.com/auth/androidpublisher';

let androidPublisherClient;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getAndroidPublisher = async () => {
    if (!env.GOOGLE_PLAY_PACKAGE_NAME || !env.GOOGLE_PLAY_SERVICE_ACCOUNT) {
        throw new BusinessException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR, constants.HTTP_INTERNAL_SERVER);
    }

    if (!androidPublisherClient) {
        const credentials = JSON.parse(env.GOOGLE_PLAY_SERVICE_ACCOUNT);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: [ANDROID_PUBLISHER_SCOPE],
        });
        androidPublisherClient = google.androidpublisher({
            version: 'v3',
            auth,
        });
    }

    return androidPublisherClient;
};

const isRetryableGoogleError = (error) => {
    const status = error?.code || error?.response?.status;

    return status >= 500 || status === 429 || !status;
};

const withRetries = async (operation, req = null) => {
    const maxAttempts = googlePlayConstants.GOOGLE_PLAY_RETRY_ATTEMPTS;
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            if (attempt === maxAttempts || !isRetryableGoogleError(error)) {
                throw error;
            }

            logger.warn({
                message: `Google Play API retry attempt ${attempt}/${maxAttempts}. Error: ${error.message}`,
                className: filename,
                req,
            });

            await sleep(googlePlayConstants.GOOGLE_PLAY_RETRY_DELAY_MS * attempt);
        }
    }

    throw lastError;
};

const getProductPurchase = async (productId, purchaseToken, req = null) => {
    try {
        const androidPublisher = await getAndroidPublisher();

        const { data } = await withRetries(
            () => androidPublisher.purchases.products.get({
                packageName: env.GOOGLE_PLAY_PACKAGE_NAME,
                productId,
                token: purchaseToken,
            }),
            req,
        );

        return data;
    } catch (error) {
        if (error instanceof BusinessException) {
            throw error;
        }

        logger.error({
            message: `Error fetching Google Play product purchase. productId=${productId}. Error: ${error.message}`,
            className: filename,
            req,
        });

        throw error;
    }
};

const consumeProduct = async (productId, purchaseToken, req = null) => {
    try {
        const androidPublisher = await getAndroidPublisher();

        await withRetries(
            () => androidPublisher.purchases.products.consume({
                packageName: env.GOOGLE_PLAY_PACKAGE_NAME,
                productId,
                token: purchaseToken,
            }),
            req,
        );
    } catch (error) {
        if (error instanceof BusinessException) {
            throw error;
        }

        logger.error({
            message: `Error consuming Google Play product. productId=${productId}. Error: ${error.message}`,
            className: filename,
            req,
        });

        throw error;
    }
};

module.exports = {
    getProductPurchase,
    consumeProduct,
};
