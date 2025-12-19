const HealthService = require('../services/health.service');

const getHealth = async (req, res, next) => {
    try {
        let jsonResponse = await HealthService.getHealth();
        const httpStatus = jsonResponse.success ? 200 : 503;
        res.status(httpStatus).json(jsonResponse);
    } catch (err) {
        next(err);
    }
};

module.exports = { getHealth };