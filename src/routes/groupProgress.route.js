const express = require('express');
const router = express.Router();
const GroupProgressValidator = require('../validators/groupProgress.validator');
const GroupProgressController = require('../controllers/groupProgress.controller');
const validateBody = require('../../shared/middlewares/validateBody');
const validateToken = require('../../shared/middlewares/validateToken');

router.post('/group/unlock', validateToken, validateBody(GroupProgressValidator.unlockGroupSchema), GroupProgressController.unlockGroup);

module.exports = router;
