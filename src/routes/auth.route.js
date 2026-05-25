const express = require('express');
const router = express.Router();
const AuthValidator = require('../validators/auth.validator');
const AuthController = require('../controllers/auth.controller');
const validateBody = require('../../shared/middlewares/validateBody');

router.post('/user/login', validateBody(AuthValidator.socialLoginSchema), AuthController.socialLogin);

router.post('/user/login/refresh', validateBody(AuthValidator.refreshTokenSchema), AuthController.refreshToken);

router.post('/user/logout', validateBody(AuthValidator.logoutSchema), AuthController.logout);

module.exports = router;
