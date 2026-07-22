class BaseResponse {
    constructor(success, messages = [], data = null) {
        this.success = success;
        this.messages = messages;
        this.data = data;
    }
}

module.exports = BaseResponse;
