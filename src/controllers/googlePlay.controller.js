const GooglePlayRtdnService = require('../services/googlePlayRtdn.service');

const handleRtdn = async (req, res, next) => {
    try {
        await GooglePlayRtdnService.processRtdnMessage(req);
        res.status(200).send();
    } catch (err) {
        next(err);
    }
};

module.exports = {
    handleRtdn,
};
