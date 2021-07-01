const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const checkHeader = require('../utils/chechHeader');
const sendOtp = require("../utils/sendOtp");
const { authService, userService, tokenService, emailService , emailServices} = require('../services');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const authtoken = await tokenService.generateDoctorToken(user.id);
  const devicehash = req.headers.devicehash;
  const devicetype = req.headers.devicetype;
  const fcmtoken = req.headers.fcmtoken;
  await tokenService.addDeviceHandler(user.id, authtoken, '1.1.1.1', devicehash, devicetype, fcmtoken);
  res.status(httpStatus.CREATED).send({ user, authtoken });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const authtoken = await tokenService.generateDoctorToken(user.id);
  const devicehash = req.headers.devicehash;
  const devicetype = req.headers.devicetype;
  const fcmtoken = req.headers.fcmtoken;
  await tokenService.addDeviceHandler(user.id, authtoken, '1.1.1.1', devicehash, devicetype, fcmtoken);
  res.send({ user, authtoken });
});

const logout = catchAsync(async (req, res) => {
  await tokenService.logoutdevice(req.body.authtoken);
  res.status(httpStatus.NO_CONTENT).send();
});

const changePassword = catchAsync(async (req, res) => {
  const oldPassword = req.body.oldpassword;
  const newPassword = req.body.newpassword;
  const headerToken = checkHeader(req);
  await authService.changeUserPassword(oldPassword, newPassword, headerToken);
  res.status(204).send({});
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const email = req.body.email;// email will come from payload
  const OTP = sendOtp();
  await emailServices.sendResetPasswordEmail(email,OTP);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const email = req.body.email;// email will come from payload
  const OTP = sendOtp();
  await emailServices.sendVerificationEmail(email,OTP);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  changePassword,
};
