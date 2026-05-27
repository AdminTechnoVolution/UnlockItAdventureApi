const path = require('path');
const { BlobServiceClient } = require('@azure/storage-blob');
const sharp = require('sharp');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const env = require('../../shared/constants/environmentSystemVariables');
const constants = require('../../shared/constants/constants');
const BusinessException = require('../../shared/commons/models/BusinessException');
const { ERROR_CODES } = require('../../shared/i18n/messages');

const PROFILE_PHOTO_MIME = 'image/webp';
const PROFILE_PHOTO_EXTENSION = 'webp';
const USER_PROFILE_FOLDER = 'userprofile';
const GROUP_PROGRESS_FOLDER = 'groupProgress';

const buildUserProfileFolderPrefix = (userId) => `${USER_PROFILE_FOLDER}/${userId}/`;
const buildUserProfileBlobPath = (userId) => `${USER_PROFILE_FOLDER}/${userId}/${userId}.${PROFILE_PHOTO_EXTENSION}`;
const buildActivityPhotoBlobPath = (groupProgressId, keyActivity, fileName) =>
    `${GROUP_PROGRESS_FOLDER}/${groupProgressId}/${keyActivity}/${fileName}`;

let blobServiceClient;

const getContainerClient = () => {
    if (!env.AZURE_STORAGE_CONNECTION_STRING || !env.AZURE_STORAGE_CONTAINER_NAME) {
        throw new BusinessException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR, constants.HTTP_INTERNAL_SERVER);
    }

    if (!blobServiceClient) {
        blobServiceClient = BlobServiceClient.fromConnectionString(env.AZURE_STORAGE_CONNECTION_STRING);
    }

    return blobServiceClient.getContainerClient(env.AZURE_STORAGE_CONTAINER_NAME);
};

const convertToWebp = async (buffer) => {
    try {
        return await sharp(buffer).webp().toBuffer();
    } catch {
        throw new BusinessException(ERROR_CODES.CODE_PHOTOS_ONLY, constants.HTTP_BAD_REQUEST);
    }
};

const deleteUserProfilePhotos = async (userId) => {
    const containerClient = getContainerClient();
    const prefix = buildUserProfileFolderPrefix(userId);

    for await (const blob of containerClient.listBlobsFlat({ prefix })) {
        await containerClient.deleteBlob(blob.name);
    }
};

const uploadUserProfilePhoto = async (userId, buffer, req = null) => {
    try {
        const webpBuffer = await convertToWebp(buffer);
        await deleteUserProfilePhotos(userId);

        const blobPath = buildUserProfileBlobPath(userId);
        const containerClient = getContainerClient();
        const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

        await blockBlobClient.upload(webpBuffer, webpBuffer.length, {
            blobHTTPHeaders: { blobContentType: PROFILE_PHOTO_MIME },
        });

        return blockBlobClient.url;
    } catch (error) {
        if (error instanceof BusinessException) {
            throw error;
        }

        logger.error({ message: `Error uploading user profile photo to Azure Blob. userId=${userId}. Error: ${error.message}`, className: filename, req });

        throw new BusinessException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR, constants.HTTP_INTERNAL_SERVER);
    }
};

const uploadActivityPhoto = async (groupProgressId, keyActivity, fileName, buffer, req = null) => {
    try {
        const webpBuffer = await convertToWebp(buffer);
        const blobPath = buildActivityPhotoBlobPath(groupProgressId, keyActivity, fileName);
        const containerClient = getContainerClient();
        const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

        await blockBlobClient.upload(webpBuffer, webpBuffer.length, {
            blobHTTPHeaders: { blobContentType: PROFILE_PHOTO_MIME },
        });

        return blockBlobClient.url;
    } catch (error) {
        if (error instanceof BusinessException) {
            throw error;
        }

        logger.error({ message: `Error uploading activity photo to Azure Blob. groupProgressId=${groupProgressId}, keyActivity=${keyActivity}, fileName=${fileName}. Error: ${error.message}`, className: filename, req });

        throw new BusinessException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR, constants.HTTP_INTERNAL_SERVER);
    }
};

const deleteActivityPhoto = async (groupProgressId, keyActivity, fileName, req = null) => {
    try {
        const blobPath = buildActivityPhotoBlobPath(groupProgressId, keyActivity, fileName);
        const containerClient = getContainerClient();
        const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

        await blockBlobClient.deleteIfExists();
    } catch (error) {
        if (error instanceof BusinessException) {
            throw error;
        }

        logger.error({ message: `Error deleting activity photo from Azure Blob. groupProgressId=${groupProgressId}, keyActivity=${keyActivity}, fileName=${fileName}. Error: ${error.message}`, className: filename, req });

        throw new BusinessException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR, constants.HTTP_INTERNAL_SERVER);
    }
};

module.exports = {
    uploadUserProfilePhoto,
    uploadActivityPhoto,
    deleteActivityPhoto,
    buildUserProfileBlobPath,
    buildActivityPhotoBlobPath,
    PROFILE_PHOTO_MIME,
    PROFILE_PHOTO_EXTENSION,
};
