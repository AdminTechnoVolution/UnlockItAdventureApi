const express = require('express');
const router = express.Router();
const GroupProgressValidator = require('../validators/groupProgress.validator');
const GroupProgressController = require('../controllers/groupProgress.controller');
const validateBody = require('../../shared/middlewares/validateBody');
const validateToken = require('../../shared/middlewares/validateToken');

router.post('/group/unlock', validateToken, validateBody(GroupProgressValidator.unlockGroupSchema), GroupProgressController.unlockGroup);

router.get('/group/progress', validateToken, GroupProgressController.getMyGroupProgress);

router.get('/group/progress/shared', validateToken, GroupProgressController.getSharedGroupProgress);

router.put('/group/progress', validateToken, validateBody(GroupProgressValidator.updateGroupProgressSchema), GroupProgressController.updateGroupProgress);

router.put('/group/progress/partners', validateToken, validateBody(GroupProgressValidator.addPartnersSchema), GroupProgressController.addPartners);

router.put('/group/progress/partners/remove', validateToken, validateBody(GroupProgressValidator.removePartnerSchema), GroupProgressController.removePartner);

module.exports = router;
