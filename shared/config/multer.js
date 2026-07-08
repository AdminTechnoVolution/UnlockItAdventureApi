const multer = require('multer');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { ERROR_CODES } = require('../i18n/messages');
const BusinessException = require('../commons/models/BusinessException');
const AppConfigService = require('../../src/services/appConfig.service');
const AppConfigKey = require('../constants/enums/EnumAppConfigKey');
const constants = require('../constants/constants');

const TMP_UPLOADS_DIR = path.join(os.tmpdir(), 'unlockit-uploads');

fs.mkdirSync(TMP_UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, TMP_UPLOADS_DIR),
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname || '').toLowerCase();
        const randomSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
        cb(null, `${randomSuffix}${extension}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedMimes = req.allowedPhotoMimeTypes;

    if (!Array.isArray(allowedMimes) || allowedMimes.length === 0) {
        return cb(new BusinessException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR, constants.HTTP_INTERNAL_SERVER));
    }

    if (allowedMimes.includes(file.mimetype)) {
        return cb(null, true);
    }

    return cb(new BusinessException(ERROR_CODES.CODE_PHOTOS_ONLY, constants.HTTP_BAD_REQUEST));
};

const createUpload = (options = {}) => multer({
    storage,
    fileFilter,
    ...options,
});

const toMaxBytes = (maxFileSizeMb) => {
    const parsed = Number(maxFileSizeMb);

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
    }

    return Math.round(parsed * 1024 * 1024);
};

const loadMaxUploadBytes = (configKey) => async (req, res, next) => {
    try {
        const config = await AppConfigService.getConfigByKey(configKey, req);
        const maxUploadBytes = toMaxBytes(config?.value);

        if (!maxUploadBytes) {
            return next(new BusinessException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR, constants.HTTP_INTERNAL_SERVER));
        }

        req.maxUploadBytes = maxUploadBytes;

        return next();
    } catch (err) {
        return next(err);
    }
};

const uploadSinglePhoto = (req, res, next) => {
    if (!req.maxUploadBytes) {
        return next(new BusinessException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR, constants.HTTP_INTERNAL_SERVER));
    }

    const limits = {
        fileSize: req.maxUploadBytes,
        files: 1,
    };

    return createUpload({ limits }).single('photo')(req, res, next);
};

const loadAllowedPhotoMimeTypes = async (req, res, next) => {
    try {
        const config = await AppConfigService.getConfigByKey(AppConfigKey.ACTIVITY_PHOTO_ALLOWED_MIME_TYPES, req);
        req.allowedPhotoMimeTypes = config?.value;

        if (!Array.isArray(req.allowedPhotoMimeTypes) || req.allowedPhotoMimeTypes.length === 0) {
            return next(new BusinessException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR, constants.HTTP_INTERNAL_SERVER));
        }

        return next();
    } catch (err) {
        return next(err);
    }
};

const upload = createUpload();

const uploadProfilePhoto = [
    loadAllowedPhotoMimeTypes,
    loadMaxUploadBytes(AppConfigKey.USER_PROFILE_PHOTO_MAX_FILE_SIZE_MB),
    uploadSinglePhoto,
];

const uploadActivityPhoto = [
    loadAllowedPhotoMimeTypes,
    loadMaxUploadBytes(AppConfigKey.ACTIVITY_PHOTO_MAX_FILE_SIZE_MB),
    uploadSinglePhoto,
];

module.exports = upload;
module.exports.uploadProfilePhoto = uploadProfilePhoto;
module.exports.uploadActivityPhoto = uploadActivityPhoto;
module.exports.loadAllowedPhotoMimeTypes = loadAllowedPhotoMimeTypes;
module.exports.createUpload = createUpload;
module.exports.loadMaxUploadBytes = loadMaxUploadBytes;
module.exports.uploadSinglePhoto = uploadSinglePhoto;
