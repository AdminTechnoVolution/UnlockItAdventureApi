const express = require('express');
const router = express.Router();
const AuthValidator = require('../validators/auth.validator');
const AuthController = require('../controllers/auth.controller');
const validateBody = require('../../shared/middlewares/validateBody');

router.post('/user/register', validateBody(AuthValidator.registerUserSchema), AuthController.registerUser);

router.post('/user/register/verify-code', validateBody(AuthValidator.verifyCodeUserSchema), AuthController.verifyCodeUser);

router.post('/user/recover/send-code', validateBody(AuthValidator.sendVerificationCodeSchema), AuthController.sendVerificationCode);

router.post('/user/recover/reset-password', validateBody(AuthValidator.resetPasswordSchema), AuthController.resetPassword);

router.post('/user/login', validateBody(AuthValidator.loginSchema), AuthController.loginUser);

router.post('/user/login/refresh', validateBody(AuthValidator.refreshTokenSchema), AuthController.refreshTokenUser);

router.post('/user/logout', validateBody(AuthValidator.logoutSchema), AuthController.logoutUser);

module.exports = router;