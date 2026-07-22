const express = require('express');
const router = express.Router();
const AppConfigController = require('../controllers/appConfig.controller');
const validateToken = require('../../shared/middlewares/validateToken');

router.get('/configs', validateToken, AppConfigController.getPublicConfigs);

module.exports = router;
