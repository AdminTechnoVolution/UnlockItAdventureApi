const { BlobServiceClient } = require('@azure/storage-blob');
const sharp = require('sharp');
const env = require('../../shared/constants/environmentSystemVariables');
const constants = require('../../shared/constants/constants');
const BusinessException = require('../../shared/commons/models/BusinessException');
const { ERROR_CODES } = require('../../shared/i18n/messages');

const PROFILE_PHOTO_MIME = 'image/webp';
const PROFILE_PHOTO_EXTENSION = 'webp';
const USER_PROFILE_FOLDER = 'userprofile';

const buildUserProfileFolderPrefix = (userId) => `${USER_PROFILE_FOLDER}/${userId}/`;
const buildUserProfileBlobPath = (userId) => `${USER_PROFILE_FOLDER}/${userId}/${userId}.${PROFILE_PHOTO_EXTENSION}`;

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

const uploadUserProfilePhoto = async (userId, buffer) => {
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

        throw new BusinessException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR, constants.HTTP_INTERNAL_SERVER);
    }
};

module.exports = {
    uploadUserProfilePhoto,
    buildUserProfileBlobPath,
    PROFILE_PHOTO_MIME,
    PROFILE_PHOTO_EXTENSION,
};
