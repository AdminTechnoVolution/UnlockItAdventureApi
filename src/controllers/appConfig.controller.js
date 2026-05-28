const AppConfigService = require('../services/appConfig.service');

const getPublicConfigs = async (req, res, next) => {
    try {
        const jsonResponse = await AppConfigService.getPublicConfigs(req);
        res.status(200).json(jsonResponse);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getPublicConfigs,
};
