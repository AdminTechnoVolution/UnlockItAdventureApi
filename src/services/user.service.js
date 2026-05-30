const path = require('path');
const ObjectId = require('mongoose').Types.ObjectId;
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const BaseResponse = require('../../shared/commons/models/BaseResponse');
const BusinessException = require('../../shared/commons/models/BusinessException');
const UserRepository = require('../repository/user.repository');
const UserStatus = require('../../shared/constants/enums/EnumUserStatus');
const constants = require('../../shared/constants/constants');
const jwt = require('../../shared/util/jwt');
const AppConfigService = require('./appConfig.service');
const AppConfigKey = require('../../shared/constants/enums/EnumAppConfigKey');
const azureBlobStorage = require('../clients/azureBlob');
const googleCloudVision = require('../clients/googleVision');
const { ERROR_CODES } = require('../../shared/i18n/messages');
const utilPhotoFile = require('../../shared/util/photoFileValidation');
const profilePhotoProcessor = require('../../shared/util/profilePhotoProcessor');

const updateProfile = async (req) => {
    const auth = req.headers['authorization'];
    const { decoded } = jwt.verifyJwtToken(auth, true);
    const { fullName, username } = req.body;
    const userId = new ObjectId(decoded.id);

    const user = await UserRepository.findOneByFilter({ _id: userId, status: UserStatus.ACTIVE }, req);

    if (!user) {
        throw new BusinessException(ERROR_CODES.CODE_USER_NOT_FOUND, constants.HTTP_NOT_FOUND);
    }

    if (fullName !== undefined) {
        user.fullName = fullName.trim();
    }

    if (username !== undefined) {
        const normalizedUsername = username.trim();
        await validateUsernameAvailable(userId, normalizedUsername, req);
        user.username = normalizedUsername;
    }

    await UserRepository.save(user, req);

    return new BaseResponse(true, []);
};

const validateUsernameAvailable = async (userId, username, req) => {
    const existingUser = await UserRepository.findOneByFilter({
        username,
        _id: { $ne: userId },
    }, req);

    if (existingUser) {
        throw new BusinessException(ERROR_CODES.CODE_USERNAME_EXISTS, constants.HTTP_CONFLICT);
    }
};

const updateProfilePhoto = async (req) => {
    const auth = req.headers['authorization'];
    const { decoded } = jwt.verifyJwtToken(auth, true);
    const userId = new ObjectId(decoded.id);
    const file = req.file;

    if (!file) {
        throw new BusinessException(ERROR_CODES.CODE_PHOTO_REQUIRED, constants.HTTP_BAD_REQUEST);
    }

    await validateProfilePhotoFile(file, req);

    const user = await UserRepository.findOneByFilter({ _id: userId, status: UserStatus.ACTIVE }, req);

    if (!user) {
        throw new BusinessException(ERROR_CODES.CODE_USER_NOT_FOUND, constants.HTTP_NOT_FOUND);
    }

    await googleCloudVision.validateImageContent(file.buffer, req);
    const processedBuffer = await profilePhotoProcessor.processProfilePhoto(file.buffer, req);
    const url = await azureBlobStorage.uploadUserProfilePhoto(userId.toString(), processedBuffer, req);

    user.profileImageUrl = url;
    const userSaved = await UserRepository.save(user, req);

    const userData = {
        username: userSaved.username,
        fullName: userSaved.fullName,
        profileImageUrl: userSaved.profileImageUrl,
    };

    return new BaseResponse(true, [], {
        user: userData,
    });
};

const validateProfilePhotoFile = async (file, req) => {
    await utilPhotoFile.validatePhotoFile(file, req, {
        maxFileSizeMbConfigKey: AppConfigKey.USER_PROFILE_PHOTO_MAX_FILE_SIZE_MB,
    });
};

module.exports = {
    updateProfile,
    updateProfilePhoto,
};
