const express = require('express');
const router = express.Router();
const AuthValidator = require('../validators/auth.validator');
const AuthController = require('../controllers/auth.controller');
const validateBody = require('../../shared/middlewares/validateBody');

router.post('/user/login', validateBody(AuthValidator.socialLoginSchema), AuthController.socialLogin);

module.exports = router;
