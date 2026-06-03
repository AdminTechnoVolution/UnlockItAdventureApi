const path = require('path');
const sharp = require('sharp');
const logger = require('../config/logger');
const filename = path.basename(__filename);
const BusinessException = require('../commons/models/BusinessException');
const constants = require('../constants/constants');
const AppConfigKey = require('../constants/enums/EnumAppConfigKey');
const {
    DEFAULT_MAX_DIMENSION_PX,
    DEFAULT_WEBP_QUALITY,
    MIN_MAX_DIMENSION,
    MAX_MAX_DIMENSION,
    MIN_WEBP_QUALITY,
    MAX_WEBP_QUALITY,
    MIN_SIZE_PX,
    MAX_SIZE_PX,
} = require('../constants/activityPhoto.constants');
const { ERROR_CODES } = require('../i18n/messages');
const AppConfigService = require('../../src/services/appConfig.service');

const clamp = (value, min, max, fallback) => {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
        return fallback;
    }

    return Math.min(max, Math.max(min, Math.round(parsed)));
};

const loadActivityPhotoConfig = async (req) => {
    const [maxDimensionConfig, sizesPxConfig, webpQualityConfig] = await Promise.all([
        AppConfigService.getConfigByKey(AppConfigKey.ACTIVITY_PHOTO_MAX_DIMENSION_PX, req),
        AppConfigService.getConfigByKey(AppConfigKey.ACTIVITY_PHOTO_SIZES_PX, req),
        AppConfigService.getConfigByKey(AppConfigKey.ACTIVITY_PHOTO_WEBP_QUALITY, req),
    ]);

    const sizesPx = sizesPxConfig?.value;

    if (!sizesPx || typeof sizesPx !== 'object' || Array.isArray(sizesPx) || Object.keys(sizesPx).length === 0) {
        throw new BusinessException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR, constants.HTTP_INTERNAL_SERVER);
    }

    const maxDimension = clamp(maxDimensionConfig?.value, MIN_MAX_DIMENSION, MAX_MAX_DIMENSION, DEFAULT_MAX_DIMENSION_PX);
    const webpQuality = clamp(webpQualityConfig?.value, MIN_WEBP_QUALITY, MAX_WEBP_QUALITY, DEFAULT_WEBP_QUALITY);

    const normalizedSizesPx = Object.entries(sizesPx).reduce((acc, [sizeKey, maxPx]) => {
        acc[sizeKey] = clamp(maxPx, MIN_SIZE_PX, MAX_SIZE_PX, maxPx);

        return acc;
    }, {});

    return { maxDimension, sizesPx: normalizedSizesPx, webpQuality };
};

const processActivityPhotoVariants = async (buffer, req = null) => {
    const { maxDimension, sizesPx, webpQuality } = await loadActivityPhotoConfig(req);

    try {
        const baseImage = sharp(buffer)
            .rotate()
            .resize({
                width: maxDimension,
                height: maxDimension,
                fit: 'inside',
                withoutEnlargement: true,
            });

        const variants = {};

        for (const [sizeKey, maxPx] of Object.entries(sizesPx)) {
            variants[sizeKey] = await baseImage
                .clone()
                .resize({
                    width: maxPx,
                    height: maxPx,
                    fit: 'inside',
                    withoutEnlargement: true,
                })
                .webp({ quality: webpQuality })
                .toBuffer();
        }

        logger.info({
            message: `Generated activity photo variants. sizes=${Object.keys(variants).join(',')}`,
            className: filename,
            req,
        });

        return variants;
    } catch {
        throw new BusinessException(ERROR_CODES.CODE_PHOTOS_ONLY, constants.HTTP_BAD_REQUEST);
    }
};

module.exports = {
    processActivityPhotoVariants,
};
