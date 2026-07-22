const express = require('express');
const router = express.Router();
const GroupController = require('../controllers/group.controller');
const validateToken = require('../../shared/middlewares/validateToken');

router.get('/group/group-activities', validateToken, GroupController.getGroupActivities);

module.exports = router;