const path = require('path');
const ObjectId = require('mongoose').Types.ObjectId;
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const BaseResponse = require('../../shared/commons/models/BaseResponse');
const BusinessException = require('../../shared/commons/models/BusinessException');
const UserRepository = require('../repository/user.repository');
const FCMTokenRepository = require('../repository/fcmToken.repository');
const GroupProgressRepository = require('../repository/groupProgress.repository');
const UserStatus = require('../../shared/constants/enums/EnumUserStatus');
const constants = require('../../shared/constants/constants');
const jwt = require('../../shared/util/jwt');
const AppConfigKey = require('../../shared/constants/enums/EnumAppConfigKey');
const AuthService = require('./auth.service');
const azureBlobStorage = require('../clients/azureBlob');
const googleCloudVision = require('../clients/googleVision');
const { ERROR_CODES, SUCCESS_CODES } = require('../../shared/i18n/messages');
const { translate } = require('../../shared/util/util');
const utilPhotoFile = require('../../shared/util/photoFileValidation');
const profilePhotoProcessor = require('../../shared/util/profilePhotoProcessor');

const AZURE_BLOB_HOST = 'blob.core.windows.net';

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

const deleteAccount = async (req) => {
    const acceptLanguage = req.acceptLanguage;
    const auth = req.headers['authorization'];
    const { decoded } = jwt.verifyJwtToken(auth, true);
    const userId = new ObjectId(decoded.id);

    const user = await UserRepository.findOneByFilter({ _id: userId, status: UserStatus.ACTIVE }, req);

    if (!user) {
        throw new BusinessException(ERROR_CODES.CODE_USER_NOT_FOUND, constants.HTTP_NOT_FOUND);
    }

    await deleteUserProfilePhotoIfExists(user, req);
    await FCMTokenRepository.deleteByUserId(userId, req);
    await deleteOwnedGroupProgressWithAzureCleanup(userId, req);
    await deletePartnerPhotosFromForeignGroupProgress(userId, req);
    await GroupProgressRepository.pullPartnerFromAll(userId, req);
    await AuthService.revokeAllAuthTokensForUser(userId);
    await UserRepository.deleteById(userId, req);

    const message = translate(SUCCESS_CODES.CODE_DELETE_ACCOUNT_SUCCESS, acceptLanguage);

    return new BaseResponse(true, [message]);
};

const deleteUserProfilePhotoIfExists = async (user, req) => {
    const profileImageUrl = user.profileImageUrl;

    if (!profileImageUrl
        || !profileImageUrl.includes(AZURE_BLOB_HOST)
        || !profileImageUrl.includes(azureBlobStorage.USER_PROFILE_FOLDER)) {
        return;
    }

    try {
        await azureBlobStorage.deleteUserProfilePhotos(user._id.toString());
    } catch (error) {
        logger.error({
            message: `Failed to delete profile photo on account delete. userId=${user._id}. Error: ${error.message}`,
            className: filename,
            req,
        });
    }
};

const deleteActivityPhotosFromGroupProgress = async (groupProgress, req) => {
    const groupProgressId = groupProgress._id.toString();

    for (const activity of groupProgress.activities || []) {
        for (const photo of activity.photos || []) {
            if (!photo.name) {
                continue;
            }

            try {
                await azureBlobStorage.deleteActivityPhotoFolder(groupProgressId, activity.key, photo.name, req);
            } catch (error) {
                logger.error({
                    message: `Failed to delete activity photo on account delete. groupProgressId=${groupProgressId}, keyActivity=${activity.key}, photoName=${photo.name}. Error: ${error.message}`,
                    className: filename,
                    req,
                });
            }
        }
    }
};

const deleteOwnedGroupProgressWithAzureCleanup = async (userId, req) => {
    const groupProgressList = await GroupProgressRepository.findByUserId(userId, req);

    for (const groupProgress of groupProgressList) {
        await deleteActivityPhotosFromGroupProgress(groupProgress, req);
    }

    await GroupProgressRepository.deleteManyByUserId(userId, req);
};

const deletePartnerPhotosFromForeignGroupProgress = async (userId, req) => {
    const groupProgressList = await GroupProgressRepository.findForeignWithPhotosByUploader(userId, req);
    const userIdStr = userId.toString();

    for (const groupProgress of groupProgressList) {
        const groupProgressId = groupProgress._id.toString();
        let modified = false;

        for (const activity of groupProgress.activities || []) {
            const photosToRemove = (activity.photos || []).filter(
                (photo) => photo.uploadedBy && photo.uploadedBy.toString() === userIdStr,
            );

            for (const photo of photosToRemove) {
                try {
                    await azureBlobStorage.deleteActivityPhotoFolder(groupProgressId, activity.key, photo.name, req);
                } catch (error) {
                    logger.error({
                        message: `Failed to delete partner activity photo on account delete. groupProgressId=${groupProgressId}, keyActivity=${activity.key}, photoName=${photo.name}. Error: ${error.message}`,
                        className: filename,
                        req,
                    });
                }

                const photoIndex = activity.photos.indexOf(photo);

                if (photoIndex !== -1) {
                    activity.photos.splice(photoIndex, 1);
                    modified = true;
                }
            }
        }

        if (modified) {
            groupProgress.markModified('activities');
            await GroupProgressRepository.save(groupProgress, req);
        }
    }
};

module.exports = {
    updateProfile,
    updateProfilePhoto,
    deleteAccount,
};
