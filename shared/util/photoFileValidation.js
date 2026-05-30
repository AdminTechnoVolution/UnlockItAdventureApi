const path = require('path');
const sharp = require('sharp');
const BusinessException = require('../commons/models/BusinessException');
const constants = require('../constants/constants');
const AppConfigKey = require('../constants/enums/EnumAppConfigKey');
const { MIME_TO_EXTENSIONS, SHARP_FORMAT_TO_MIME } = require('../constants/image.constants');
const { ERROR_CODES } = require('../i18n/messages');
const AppConfigService = require('../../src/services/appConfig.service');

const validateImageBufferContent = async (buffer, declaredMime, allowedMimes) => {
    let metadata;

    try {
        metadata = await sharp(buffer).metadata();
    } catch {
        throw new BusinessException(ERROR_CODES.CODE_PHOTOS_ONLY, constants.HTTP_BAD_REQUEST);
    }

    const detectedMime = SHARP_FORMAT_TO_MIME[metadata.format];

    if (!detectedMime || !allowedMimes.includes(detectedMime)) {
        throw new BusinessException(ERROR_CODES.CODE_PHOTOS_ONLY, constants.HTTP_BAD_REQUEST);
    }

    if (declaredMime && detectedMime !== declaredMime) {
        throw new BusinessException(ERROR_CODES.CODE_PHOTOS_ONLY, constants.HTTP_BAD_REQUEST);
    }
};

const validatePhotoFile = async (file, req, { maxFileSizeMbConfigKey }) => {
    const maxFileSizeMb = (await AppConfigService.getConfigByKey(maxFileSizeMbConfigKey, req))?.value;

    if (maxFileSizeMb === undefined || maxFileSizeMb === null) {
        throw new BusinessException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR, constants.HTTP_INTERNAL_SERVER);
    }

    const maxBytes = Number(maxFileSizeMb) * 1024 * 1024;

    if (file.size > maxBytes) {
        throw new BusinessException(ERROR_CODES.CODE_PHOTO_TOO_LARGE, constants.HTTP_BAD_REQUEST);
    }

    const mimeConfig = await AppConfigService.getConfigByKey(AppConfigKey.ACTIVITY_PHOTO_ALLOWED_MIME_TYPES, req);
    const allowedMimes = mimeConfig?.value;

    if (!Array.isArray(allowedMimes) || allowedMimes.length === 0) {
        throw new BusinessException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR, constants.HTTP_INTERNAL_SERVER);
    }

    if (!allowedMimes.includes(file.mimetype)) {
        throw new BusinessException(ERROR_CODES.CODE_PHOTOS_ONLY, constants.HTTP_BAD_REQUEST);
    }

    const fileExtension = path.extname(file.originalname || '').toLowerCase();
    const allowedExtensions = allowedMimes.flatMap((mime) => MIME_TO_EXTENSIONS[mime] || []);

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        throw new BusinessException(ERROR_CODES.CODE_PHOTO_INVALID_EXTENSION, constants.HTTP_BAD_REQUEST);
    }

    await validateImageBufferContent(file.buffer, file.mimetype, allowedMimes);
};

module.exports = {
    validateImageBufferContent,
    validatePhotoFile,
};
