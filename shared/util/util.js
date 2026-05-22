const { TRANSLATIONS } = require("../i18n/messages");
const constants = require('../constants/constants');
const env = require('../constants/environmentSystemVariables');

const getEnumByValue = (EnumType, value, enumName = 'EnumType') => {
    for (const [key, item] of Object.entries(EnumType)) {
        if (item.value === value) {
            return { key, ...item };
        }
    }

    return `${constants.UNKNOWN_NOTIFICATION_TYPE} for ${enumName} and value: ${value}`;
};

const translate = (key, lang) => {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[lang] || entry.en;
};

const pickLanguage = (obj, lang, fallback = env.DEFAULT_LANGUAGE) => {
    if (!obj || typeof obj !== "object") return obj;
    return obj[lang] || obj[fallback] || null;
};

const getKeyRedis = (key) => {
    return `${env.REDIS_APP_NAME}:${key}`;
};

module.exports = {
    getEnumByValue,
    translate,
    pickLanguage,
    getKeyRedis,
};
