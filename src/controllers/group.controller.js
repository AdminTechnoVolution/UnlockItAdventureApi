const GroupService = require('../services/group.service');

const getGroupActivities = async (req, res, next) => {
    try {
        let jsonResponse = await GroupService.getGroupActivities(req);
        res.status(200).json(jsonResponse);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getGroupActivities
};