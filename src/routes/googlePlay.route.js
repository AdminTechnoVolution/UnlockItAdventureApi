const express = require('express');
const router = express.Router();
const GooglePlayController = require('../controllers/googlePlay.controller');
const validatePubSubPush = require('../../shared/middlewares/validatePubSubPush');

router.post('/google-play/rtdn', validatePubSubPush, GooglePlayController.handleRtdn);

module.exports = router;
