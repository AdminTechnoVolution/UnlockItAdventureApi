const path = require('path');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const AppConfigRepository = require('../repository/appConfig.repository');
const cache = require('../../shared/config/cache');
const consCache = require('../../shared/constants/constants.cache');
const env = require('../../shared/constants/environmentSystemVariables');
const BaseResponse = require('../../shared/commons/models/BaseResponse');

const getConfigs = async (req = null) => {
    let configs = cache.get(consCache.CACHE_KEY_CONFIGS);

    if (!configs) {
        logger.info({ message: 'Fetching AppConfigs from MongoDB', className: filename, req });
        configs = await AppConfigRepository.findAll({}, { key: 1 }, req);
        cache.set(consCache.CACHE_KEY_CONFIGS, configs, env.MASTER_DATA_CACHE_TTL_SECS);
    }

    return configs;
};

const getConfigByKey = async (key, req = null) => {
    const configs = await getConfigs(req);
    return configs.find((config) => config.key === key) ?? null;
};

const getPublicConfigs = async (req = null) => {
    const configs = await getConfigs(req);

    const data = configs.map((config) => ({
        key: config.key,
        value: config.value,
        description: config.description ?? null,
    }));

    return new BaseResponse(true, [], data);
};

module.exports = {
    getConfigs,
    getConfigByKey,
    getPublicConfigs,
};
