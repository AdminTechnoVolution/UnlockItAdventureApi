const constants = require("../../constants/constants");

class DataLayerException extends Error {
    constructor(message, statusCode = constants.HTTP_INTERNAL_SERVER, name = 'DataLayerException') {
        super(message);
        this.name = name;
        this.statusCode = statusCode;
    }
}

module.exports = DataLayerException;
