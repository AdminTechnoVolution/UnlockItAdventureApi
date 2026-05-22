const { OAuth2Client } = require('google-auth-library');
const env = require('../../shared/constants/environmentSystemVariables');

const getGoogleClientIds = () => (env.GOOGLE_CLIENT_IDS || '')
    .split(',')
    .map((clientId) => clientId.trim())
    .filter(Boolean);

const verifyGoogleToken = async (tokenId) => {
    const audiences = getGoogleClientIds();

    if (!audiences.length) {
        throw new Error('GOOGLE_CLIENT_IDS is not configured');
    }

    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: audiences,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub) {
        throw new Error('Invalid Google token payload');
    }

    return {
        providerId: payload.sub,
        email: payload.email?.toLowerCase(),
        fullName: payload.name || payload.given_name || null,
        profileImageUrl: payload.picture || null,
    };
};

module.exports = {
    verifyGoogleToken,
};
