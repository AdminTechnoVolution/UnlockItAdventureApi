const path = require('path');
const fs = require('fs/promises');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const env = require('../../shared/constants/environmentSystemVariables');
const constants = require('../../shared/constants/constants');
const BusinessException = require('../../shared/commons/models/BusinessException');
const { ERROR_CODES } = require('../../shared/i18n/messages');
const visionServiceAccount = JSON.parse(env.VISION_SERVICE_ACCOUNT);
const visionClient = new ImageAnnotatorClient({
    credentials: visionServiceAccount,
});

const BLOCKED_LIKELIHOODS = new Set(['LIKELY', 'VERY_LIKELY']);

const SAFE_SEARCH_CATEGORIES = {
    ADULT: 'adult',
    VIOLENCE: 'violence',
};

const CHECKED_CATEGORIES = Object.values(SAFE_SEARCH_CATEGORIES);

const toImageBuffer = async (imageInput) => {
    if (Buffer.isBuffer(imageInput)) {
        return imageInput;
    }

    if (typeof imageInput === 'string') {
        return fs.readFile(imageInput);
    }

    if (imageInput?.buffer && Buffer.isBuffer(imageInput.buffer)) {
        return imageInput.buffer;
    }

    if (imageInput?.filePath && typeof imageInput.filePath === 'string') {
        return fs.readFile(imageInput.filePath);
    }

    throw new BusinessException(ERROR_CODES.CODE_PHOTOS_ONLY, constants.HTTP_BAD_REQUEST);
};

const detectSafeSearch = async (imageInput, req = null) => {
    const imageBuffer = await toImageBuffer(imageInput);

    logger.info({ message: `Analyzing image with Google Cloud Vision Safe Search. Size=${imageBuffer?.length ?? 0} bytes`, className: filename, req });

    const [result] = await visionClient.safeSearchDetection(imageBuffer);

    logger.info({ message: `Image analyzed with Google Cloud Vision Safe Search. Result=${JSON.stringify(result?.safeSearchAnnotation)}`, className: filename, req });
    return result?.safeSearchAnnotation ?? null;
};

const getFlaggedCategories = (safeSearch) => {
    if (!safeSearch) {
        return [];
    }

    return CHECKED_CATEGORIES.filter((category) => BLOCKED_LIKELIHOODS.has(safeSearch[category]));
};

const logImageRejected = (safeSearch, flaggedCategories, req) => {
    const details = flaggedCategories
        .map((category) => `${category}=${safeSearch[category]}`)
        .join(', ');

    logger.error({ message: `Image upload rejected. Flagged categories: ${details}`, className: filename, req });
};

const isUndesirableImage = async (imageInput, req = null) => {
    const safeSearch = await detectSafeSearch(imageInput, req);
    const flaggedCategories = getFlaggedCategories(safeSearch);

    if (flaggedCategories.length > 0) {
        logImageRejected(safeSearch, flaggedCategories, req);
        return true;
    }

    return false;
};

const validateImageContent = async (imageInput, req = null) => {
    try {
        const safeSearch = await detectSafeSearch(imageInput, req);
        const flaggedCategories = getFlaggedCategories(safeSearch);

        if (flaggedCategories.length > 0) {
            logImageRejected(safeSearch, flaggedCategories, req);
            throw new BusinessException(ERROR_CODES.CODE_IMAGE_CONTENT_NOT_ALLOWED, constants.HTTP_BAD_REQUEST);
        }
    } catch (error) {
        if (error instanceof BusinessException) {
            throw error;
        }

        logger.error({ message: `Error analyzing image with Google Cloud Vision. Error: ${error.message}`, className: filename, req });
        throw new BusinessException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR, constants.HTTP_INTERNAL_SERVER);
    }
};

module.exports = {
    detectSafeSearch,
    getFlaggedCategories,
    isUndesirableImage,
    validateImageContent,
    SAFE_SEARCH_CATEGORIES,
    BLOCKED_LIKELIHOODS,
};
