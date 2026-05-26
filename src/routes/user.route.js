const express = require('express');
const router = express.Router();
const UserValidator = require('../validators/user.validator');
const UserController = require('../controllers/user.controller');
const validateBody = require('../../shared/middlewares/validateBody');
const validateToken = require('../../shared/middlewares/validateToken');
const { uploadProfilePhoto } = require('../../shared/config/multer');

router.put('/user/profile', validateToken, validateBody(UserValidator.updateProfileSchema), UserController.updateProfile);

router.put('/user/profile/photo', validateToken, ...uploadProfilePhoto, UserController.updateProfilePhoto);

module.exports = router;
