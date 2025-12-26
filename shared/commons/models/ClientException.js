const constants = require("../../constants/constants");
class ClientException extends Error {
    constructor(message, statusCode = constants.HTTP_BAD_REQUEST, name = 'ClientException') {
        super(message);
        this.name = name;
        this.statusCode = statusCode;
    }
}

module.exports = ClientException;
