module.exports = {
    HTTP_UNATHORIZED: 401,
    MAX_CHARS_LOG_PER_STRING: 256,
    HEADER_CORRELATION_ID: "x-correlation-id",
    SENSITIVE_KEYS: ['password', 'token', 'accesstoken', 'refreshtoken', 'authorization', 'purchasetoken', 'offertoken', 'verificationcode', 'fcmtoken'],
    MASK_SENSITIVE_KEYS: '**********',
    ALPHABET_NUMBERS: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    PASSWORD_PATTERN: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$",
    ERROR_GENERIC_RESPONSE: "ERROR_GENERIC_RESPONSE",
    ERROR_UNAUTHORIZED: "ERROR_UNAUTHORIZED",
    ERROR_BAD_REQUEST_RESPONSE: "ERROR_BAD_REQUEST_RESPONSE",
    ERROR_GENERIC_LOGGING_RESPONSE: "ERROR_GENERIC_LOGGING_RESPONSE"
};
