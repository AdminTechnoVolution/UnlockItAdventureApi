const path = require('path');
const { OAuth2Client } = require('google-auth-library');
const logger = require('../config/logger');
const filename = path.basename(__filename);
const env = require('../constants/environmentSystemVariables');

const oauthClient = new OAuth2Client();

module.exports = async (req, res, next) => {
    if (!env.GOOGLE_PLAY_RTDN_AUDIENCE) {
        logger.error({ message: 'GOOGLE_PLAY_RTDN_AUDIENCE is not configured', className: filename, req });
        return res.status(500).send();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).send();
    }

    const token = authHeader.slice('Bearer '.length);

    try {
        await oauthClient.verifyIdToken({
            idToken: token,
            audience: env.GOOGLE_PLAY_RTDN_AUDIENCE,
        });
        next();
    } catch (error) {
        logger.error({
            message: `Pub/Sub push JWT verification failed: ${error.message}`,
            className: filename,
            req,
        });
        return res.status(401).send();
    }
};
