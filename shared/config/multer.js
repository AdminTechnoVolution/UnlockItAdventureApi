const multer = require('multer');
const { ERROR_CODES } = require('../i18n/messages');
const BusinessException = require('../commons/models/BusinessException');
const storage = multer.memoryStorage();

const allowedMimes = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const fileFilter = (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        throw new BusinessException(ERROR_CODES.CODE_PHOTOS_ONLY);
    }
};

const upload = multer({
    storage,
    fileFilter
});

module.exports = upload;
