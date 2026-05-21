const path = require('path');
const logger = require('../../shared/config/logger');
const filename = path.basename(__filename);
const BaseResponse = require('../../shared/commons/models/BaseResponse');
const ObjectId = require("mongoose").Types.ObjectId;
const GroupRepository = require('../repository/group.repository');
const GroupProgressRepository = require('../repository/groupProgress.repository');
const cache = require("../../shared/config/cache");
const consCache = require('../../shared/constants/constants.cache');
const env = require('../../shared/constants/environmentSystemVariables');
const util = require('../../shared/util/util');
const jwt = require('../../shared/util/jwt');

const getGroupActivities = async (req) => {
    const acceptLanguage = req.acceptLanguage;
    const auth = req.headers['authorization'];
    const { decoded } = jwt.verifyJwtToken(auth, true);

    let groups = cache.get(consCache.CACHE_KEY_GROUPS);
    if (!groups) {
        logger.info({ message: `Fetching GroupActivities from MongoDB`, className: filename, req: req });
        const filter = { isActive: true };
        const sort = {};
        groups = await GroupRepository.find(filter, sort, req);
        cache.set(consCache.CACHE_KEY_GROUPS, groups, env.MASTER_DATA_CACHE_TTL_SECS);
    }

    const groupProgress = await getProgressByUserId(decoded['id'], req);
    groups = groups.map(g => mapGroupLang(g, acceptLanguage));
    addFieldsToGroups(groups, groupProgress, decoded['id']);

    return new BaseResponse(true, [], groups);
};

const getProgressByUserId = async (userId, req) => {
    const id = new ObjectId(userId);
    const filter = {
        $or: [
            { "userId": id },
            { "partnerId": id }
        ]
    };
    const sort = {};
    return await GroupProgressRepository.find(filter, sort, req);
}

const addFieldsToGroups = (groups, groupProgress, userId) => {
    const userIdStr = userId.toString();

    const groupProgressMap = new Map(
        groupProgress.map(gp => [gp.groupId.toString(), gp])
    );

    groups.forEach(g => {
        g.unlocked = false;
        g.sharedWithMe = false;

        const gp = groupProgressMap.get(g._id.toString());
        if (!gp) return;

        if (gp.userId?.toString() === userIdStr) g.unlocked = true;

        if (gp.partnerId?.some((partnerId) => partnerId.toString() === userIdStr)) g.sharedWithMe = true;
    });
};

const mapGroupLang = (group, lang) => {
    return {
        ...group,
        name: util.pickLanguage(group.name, lang),
        description: util.pickLanguage(group.description, lang),
        additionalInfo: util.pickLanguage(group.additionalInfo, lang),
        activities: group.activities?.map(a => ({
            ...a,
            name: util.pickLanguage(a.name, lang),
            description: util.pickLanguage(a.description, lang),
            tips: util.pickLanguage(a.tips, lang),
            additionalInfo: util.pickLanguage(a.additionalInfo, lang),
        })),
        prices: group.prices?.map(p => ({
            ...p,
            features: util.pickLanguage(p.features, lang)
        }))
    }
};

module.exports = {
    getGroupActivities
};