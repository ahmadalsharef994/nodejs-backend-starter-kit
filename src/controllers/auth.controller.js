
// auth.controller.js
const httpStatus = require('http-status');
const authService = require('../services/auth.service');
const tokenService = require('../services/token.service');
const catchAsync = require('../utils/catchAsync');

const register = catchAsync(async (req, res) => {
  const user = await authService.register(req.body);
  const token = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, token });
});

const login = catchAsync(async (req, res) => {
  const { email, password, role } = req.body;
  const user = await authService.loginWithEmailAndPassword(email, password, role);
  const token = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).send({ user, token });
});

const getProfile = catchAsync(async (req, res) => {
  const user = await authService.getAuthById(req.user.id);
  res.status(httpStatus.OK).send(user);
});

const forgotPassword = catchAsync(async (req, res) => {
  await authService.sendResetPasswordOtp(req.body);
  res.status(httpStatus.OK).send({ message: 'OTP sent to email/phone' });
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body);
  res.status(httpStatus.OK).send({ message: 'Password reset successfully' });
});

const changePassword = catchAsync(async (req, res) => {
  await authService.changeAuthPassword(req.body, req.user.id);
  res.status(httpStatus.OK).send({ message: 'Password changed successfully' });
});

const logout = catchAsync(async (req, res) => {
  await tokenService.logout(req.user.token);
  res.status(httpStatus.OK).send({ message: 'Logged out successfully' });
});

module.exports = {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
};

