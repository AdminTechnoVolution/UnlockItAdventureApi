const path = require('path');
const sharp = require('sharp');
const logger = require('../config/logger');
const filename = path.basename(__filename);
const BusinessException = require('../commons/models/BusinessException');
const constants = require('../constants/constants');
const AppConfigKey = require('../constants/enums/EnumAppConfigKey');
const { ERROR_CODES } = require('../i18n/messages');
const AppConfigService = require('../../src/services/appConfig.service');

const DEFAULT_MAX_DIMENSION = 512;
const DEFAULT_WEBP_QUALITY = 80;
const MIN_MAX_DIMENSION = 128;
const MAX_MAX_DIMENSION = 1024;
const MIN_WEBP_QUALITY = 1;
const MAX_WEBP_QUALITY = 100;

const clamp = (value, min, max, fallback) => {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
        return fallback;
    }

    return Math.min(max, Math.max(min, Math.round(parsed)));
};

const processProfilePhoto = async (buffer, req = null) => {
    const maxDimensionConfig = await AppConfigService.getConfigByKey(AppConfigKey.USER_PROFILE_PHOTO_MAX_DIMENSION_PX, req);
    const webpQualityConfig = await AppConfigService.getConfigByKey(AppConfigKey.USER_PROFILE_PHOTO_WEBP_QUALITY, req);

    const maxDimension = clamp(maxDimensionConfig?.value, MIN_MAX_DIMENSION, MAX_MAX_DIMENSION, DEFAULT_MAX_DIMENSION);
    const webpQuality = clamp(webpQualityConfig?.value, MIN_WEBP_QUALITY, MAX_WEBP_QUALITY, DEFAULT_WEBP_QUALITY);

    try {
        const imageInput = buffer?.filePath || buffer;
        const processedBuffer = await sharp(imageInput)
            .rotate()
            .resize({
                width: maxDimension,
                height: maxDimension,
                fit: 'inside',
                withoutEnlargement: true,
            })
            .webp({ quality: webpQuality })
            .toBuffer();

        logger.info({ message: `After resizing profile photo. Size=${processedBuffer.length} bytes`, className: filename, req });

        return processedBuffer;
    } catch {
        throw new BusinessException(ERROR_CODES.CODE_PHOTOS_ONLY, constants.HTTP_BAD_REQUEST);
    }
};

module.exports = {
    processProfilePhoto,
};
