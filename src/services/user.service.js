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
const { ERROR_CODES } = require('../../shared/i18n/messages');

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

module.exports = {
    updateProfile,
};
