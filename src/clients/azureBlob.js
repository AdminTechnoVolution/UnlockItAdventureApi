const path = require('path');
const { BlobServiceClient } = require('@azure/storage-blob');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const env = require('../../shared/constants/environmentSystemVariables');
const constants = require('../../shared/constants/constants');
const BusinessException = require('../../shared/commons/models/BusinessException');
const { ACTIVITY_PHOTO_EXTENSION } = require('../../shared/constants/activityPhoto.constants');
const { ERROR_CODES } = require('../../shared/i18n/messages');

const PROFILE_PHOTO_MIME = 'image/webp';
const PROFILE_PHOTO_EXTENSION = 'webp';
const USER_PROFILE_FOLDER = 'userprofile';
const GROUP_PROGRESS_FOLDER = 'groupProgress';

const buildUserProfileFolderPrefix = (userId) => `${USER_PROFILE_FOLDER}/${userId}/`;
const buildUserProfileBlobPath = (userId) => `${USER_PROFILE_FOLDER}/${userId}/${userId}.${PROFILE_PHOTO_EXTENSION}`;
const buildActivityPhotoFolderPrefix = (groupProgressId, keyActivity, pathPhotoName) =>
    `${GROUP_PROGRESS_FOLDER}/${groupProgressId}/${keyActivity}/${pathPhotoName}/`;
const buildActivityPhotoBlobPath = (groupProgressId, keyActivity, pathPhotoName, sizeKey) =>
    `${buildActivityPhotoFolderPrefix(groupProgressId, keyActivity, pathPhotoName)}${sizeKey}.${ACTIVITY_PHOTO_EXTENSION}`;

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

const deleteUserProfilePhotos = async (userId) => {
    const containerClient = getContainerClient();
    const prefix = buildUserProfileFolderPrefix(userId);

    for await (const blob of containerClient.listBlobsFlat({ prefix })) {
        await containerClient.deleteBlob(blob.name);
    }
};

const uploadUserProfilePhoto = async (userId, webpBuffer, req = null) => {
    try {
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

const uploadActivityPhotoVariant = async ({ containerClient, groupProgressId, keyActivity, pathPhotoName, sizeKey, webpBuffer }) => {
    const blobPath = buildActivityPhotoBlobPath(groupProgressId, keyActivity, pathPhotoName, sizeKey);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    await blockBlobClient.upload(webpBuffer, webpBuffer.length, {
        blobHTTPHeaders: { blobContentType: PROFILE_PHOTO_MIME },
    });

    return blockBlobClient.url;
};

const uploadActivityPhotoVariantStream = async ({ containerClient, groupProgressId, keyActivity, pathPhotoName, sizeKey, webpStream, req = null }) => {
    try {
        const targetContainerClient = containerClient || getContainerClient();
        const blobPath = buildActivityPhotoBlobPath(groupProgressId, keyActivity, pathPhotoName, sizeKey);
        const blockBlobClient = targetContainerClient.getBlockBlobClient(blobPath);

        await blockBlobClient.uploadStream(webpStream, 4 * 1024 * 1024, 5, {
            blobHTTPHeaders: { blobContentType: PROFILE_PHOTO_MIME },
        });

        return blockBlobClient.url;
    } catch (error) {
        if (error instanceof BusinessException) {
            throw error;
        }

        logger.error({
            message: `Error uploading streamed activity photo variant to Azure Blob. groupProgressId=${groupProgressId}, keyActivity=${keyActivity}, pathPhotoName=${pathPhotoName}, sizeKey=${sizeKey}. Error: ${error.message}`,
            className: filename,
            req,
        });

        throw new BusinessException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR, constants.HTTP_INTERNAL_SERVER);
    }
};

const uploadActivityPhotoVariants = async (groupProgressId, keyActivity, pathPhotoName, variantsMap, req = null) => {
    try {
        const containerClient = getContainerClient();
        const entries = Object.entries(variantsMap);

        const urlsBySize = await Promise.all(
            entries.map(async ([sizeKey, webpBuffer]) => {
                const url = await uploadActivityPhotoVariant({
                    containerClient,
                    groupProgressId,
                    keyActivity,
                    pathPhotoName,
                    sizeKey,
                    webpBuffer,
                });

                return [sizeKey, url];
            }),
        );

        return Object.fromEntries(urlsBySize);
    } catch (error) {
        if (error instanceof BusinessException) {
            throw error;
        }

        logger.error({
            message: `Error uploading activity photo variants to Azure Blob. groupProgressId=${groupProgressId}, keyActivity=${keyActivity}, pathPhotoName=${pathPhotoName}. Error: ${error.message}`,
            className: filename,
            req,
        });

        throw new BusinessException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR, constants.HTTP_INTERNAL_SERVER);
    }
};

const deleteActivityPhotoFolder = async (groupProgressId, keyActivity, pathPhotoName, req = null) => {
    try {
        const containerClient = getContainerClient();
        const prefix = buildActivityPhotoFolderPrefix(groupProgressId, keyActivity, pathPhotoName);

        for await (const blob of containerClient.listBlobsFlat({ prefix })) {
            await containerClient.deleteBlob(blob.name);
        }
    } catch (error) {
        if (error instanceof BusinessException) {
            throw error;
        }

        logger.error({
            message: `Error deleting activity photo folder from Azure Blob. groupProgressId=${groupProgressId}, keyActivity=${keyActivity}, pathPhotoName=${pathPhotoName}. Error: ${error.message}`,
            className: filename,
            req,
        });

        throw new BusinessException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR, constants.HTTP_INTERNAL_SERVER);
    }
};

module.exports = {
    uploadUserProfilePhoto,
    uploadActivityPhotoVariants,
    uploadActivityPhotoVariantStream,
    deleteUserProfilePhotos,
    deleteActivityPhotoFolder,
    getContainerClient,
    buildUserProfileBlobPath,
    buildActivityPhotoBlobPath,
    buildActivityPhotoFolderPrefix,
    PROFILE_PHOTO_MIME,
    PROFILE_PHOTO_EXTENSION,
    USER_PROFILE_FOLDER,
};
