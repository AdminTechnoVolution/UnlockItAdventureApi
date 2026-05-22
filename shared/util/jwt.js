const path = require('path');
const logger = require('../config/logger');
const filename = path.basename(__filename);
const jwt = require('jsonwebtoken');
const env = require('../constants/environmentSystemVariables');

const verifyJwtToken = (token, extractBearer = true) => {
    try {
        if (extractBearer)
            token = token.split(' ')[1];
        const decoded = jwt.verify(token, env.JWT_SECRET_KEY);
        return { token, decoded };
    } catch (error) {
        logger.error(`Error verifying JWT token: ${error}`, { className: filename });
        return { token: undefined, decoded: undefined };
    }
};

module.exports = { verifyJwtToken };
