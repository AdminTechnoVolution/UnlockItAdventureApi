const { OAuth2Client } = require('google-auth-library');
const env = require('../../shared/constants/environmentSystemVariables');
const constants = require('../../shared/constants/constants');
const BusinessException = require('../../shared/commons/models/BusinessException');
const { ERROR_CODES } = require('../../shared/i18n/messages');

const getGoogleClientIds = () => (env.GOOGLE_CLIENT_IDS || '')
    .split(',')
    .map((clientId) => clientId.trim())
    .filter(Boolean);

const verifyGoogleToken = async (tokenId) => {
    const audiences = getGoogleClientIds();

    if (!audiences.length) {
        throw new BusinessException(ERROR_CODES.ERROR_INTERNAL_SERVER_ERROR, constants.HTTP_INTERNAL_SERVER);
    }

    try {
        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: audiences,
        });
        const payload = ticket.getPayload();

        if (!payload?.sub) {
            throw new BusinessException(ERROR_CODES.CODE_SOCIAL_AUTH_FAILED, constants.HTTP_UNAUTHORIZED);
        }

        return {
            providerId: payload.sub,
            email: payload.email?.toLowerCase(),
            fullName: payload.name || payload.given_name || null,
            profileImageUrl: payload.picture || null,
        };
    } catch (error) {
        if (error instanceof BusinessException) {
            throw error;
        }

        throw new BusinessException(ERROR_CODES.CODE_SOCIAL_AUTH_FAILED, constants.HTTP_UNAUTHORIZED);
    }
};

module.exports = {
    verifyGoogleToken,
};
