const { ERROR_CODES } = require('../../shared/i18n/messages');
const AuthService = require('../services/auth.service');
const BusinessException = require('../../shared/commons/models/BusinessException');

const registerUser = async (req, res, next) => {
  try {
    if (!req.body) throw new BusinessException(ERROR_CODES.ERROR_BAD_REQUEST_RESPONSE);

    let jsonResponse = await AuthService.registerUser(req);
    res.status(200).json(jsonResponse);
  } catch (err) {
    next(err);
  }
};

const verifyCodeUser = async (req, res, next) => {
  try {
    if (!req.body) throw new BusinessException(ERROR_CODES.ERROR_BAD_REQUEST_RESPONSE);

    let jsonResponse = await AuthService.verifyCodeUser(req);
    res.status(200).json(jsonResponse);
  } catch (err) {
    next(err);
  }
};

const sendVerificationCode = async (req, res, next) => {
  try {
    if (!req.body) throw new BusinessException(ERROR_CODES.ERROR_BAD_REQUEST_RESPONSE);

    let jsonResponse = await AuthService.sendVerificationCode(req);
    res.status(200).json(jsonResponse);
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    if (!req.body) throw new BusinessException(ERROR_CODES.ERROR_BAD_REQUEST_RESPONSE);

    let jsonResponse = await AuthService.resetPassword(req);
    res.status(200).json(jsonResponse);
  } catch (err) {
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    if (!req.body) throw new BusinessException(ERROR_CODES.ERROR_BAD_REQUEST_RESPONSE);

    let jsonResponse = await AuthService.loginUser(req);
    res.status(200).json(jsonResponse);
  } catch (err) {
    next(err);
  }
};

const refreshTokenUser = async (req, res, next) => {
  try {
    if (!req.body) throw new BusinessException(ERROR_CODES.ERROR_BAD_REQUEST_RESPONSE);

    let jsonResponse = await AuthService.refreshTokenUser(req);
    res.status(200).json(jsonResponse);
  } catch (err) {
    next(err);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    if (!req.body) throw new BusinessException(ERROR_CODES.ERROR_BAD_REQUEST_RESPONSE);

    let jsonResponse = await AuthService.logoutUser(req);
    res.status(200).json(jsonResponse);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  verifyCodeUser,
  sendVerificationCode,
  resetPassword,
  loginUser,
  refreshTokenUser,
  logoutUser
};