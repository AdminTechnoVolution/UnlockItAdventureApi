const constants = require("../../constants/constants");

class BusinessException extends Error {
    constructor(message, statusCode = constants.HTTP_BAD_REQUEST, name = 'BusinessException') {
        super(message);
        this.name = name;
        this.statusCode = statusCode;
    }
}

module.exports = BusinessException;
