const httpStatus = require('../../node_modules/http-status');
const catchAsync = require('../utils/catchAsync');
const generateOTP = require('../utils/generateOTP');
const { authService, userService, tokenService, emailServices, otpServices } = require('../services');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const authtoken = await tokenService.generateUserToken(user.id);
  const devicehash = req.headers.devicehash;
  const devicetype = req.headers.devicetype;
  const fcmtoken = req.headers.fcmtoken;
  await tokenService.addDeviceHandler(user.id, authtoken, '1.1.1.1', devicehash, devicetype, fcmtoken);
  res.status(httpStatus.CREATED).send({ user, authtoken });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const authtoken = await tokenService.generateUserToken(user.id);
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

const forgotPassword = catchAsync(async (req, res) => {
  const AuthData = await userService.getUserByEmail(req.body.email);
  const OTP = generateOTP();
  await emailServices.sendResetPasswordEmail(req.body.email, OTP);
  await otpServices.sendresetpassotp(OTP, AuthData);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body.email,req.body.resetcode, req.body.newpassword);
  res.status(httpStatus.NO_CONTENT).send();
});


const sendVerificationEmail = catchAsync(async (req, res) => {
  const AuthData = await userService.getUserById(req.SubjectId);
  const OTP = generateOTP();
  await emailServices.sendVerificationEmail(AuthData.email, OTP);
  await otpServices.sendemailverifyotp(OTP, AuthData);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  const AuthData = await userService.getUserById(req.SubjectId);
  await otpServices.verifyEmailOtp(req.body.emailcode, AuthData);
  res.status(httpStatus.NO_CONTENT).send();
});

const requestOtp = catchAsync(async (req, res) => {
  const AuthData = await userService.getUserById(req.SubjectId);
  const OTP = generateOTP();
  await otpServices.sendphoneverifyotp(OTP, AuthData);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyPhone = catchAsync(async (req, res) => {
  const AuthData = await userService.getUserById(req.SubjectId);
  await otpServices.verifyPhoneOtp(req.body.otp, AuthData);
  res.status(httpStatus.NO_CONTENT).send();
});


const resendOtp = catchAsync(async (req, res) => {
  const AuthData = await userService.getUserById(req.SubjectId);
  const OTP = generateOTP();
  await otpServices.regenerateOTP(OTP, AuthData);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  changePassword,
  requestOtp,
  verifyPhone,
  resendOtp,
};
