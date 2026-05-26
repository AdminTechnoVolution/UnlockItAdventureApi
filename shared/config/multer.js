const multer = require('multer');
const { ERROR_CODES } = require('../i18n/messages');
const BusinessException = require('../commons/models/BusinessException');
const AppConfigService = require('../../src/services/appConfig.service');
const AppConfigKey = require('../constants/enums/EnumAppConfigKey');
const constants = require('../constants/constants');

const storage = multer.memoryStorage();

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
    createUpload().single('photo'),
];

module.exports = upload;
module.exports.uploadProfilePhoto = uploadProfilePhoto;
module.exports.loadAllowedPhotoMimeTypes = loadAllowedPhotoMimeTypes;
module.exports.createUpload = createUpload;
