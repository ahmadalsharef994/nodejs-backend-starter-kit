const httpStatus = require('../../node_modules/http-status');
const catchAsync = require('../utils/catchAsync');
const generateOTP = require('../utils/generateOTP');
const checkHeader = require('../utils/chechHeader');
const { authService, tokenService, otpServices } = require('../services');
const { emailService } = require('../Microservices');
// const SessionCheck = require('../utils/SessionCheck');

const register = catchAsync(async (req, res) => {
  const AuthData = await authService.createAuthData(req.body);
  const authtoken = await tokenService.generateUserToken(AuthData.id);
  const devicehash = req.headers.devicehash;
  const devicetype = req.headers.devicetype;
  const fcmtoken = req.headers.fcmtoken;
  await tokenService.addDeviceHandler(AuthData.id, authtoken, '1.1.1.1', devicehash, devicetype, fcmtoken);
  res.status(httpStatus.CREATED).json({ AuthData, authtoken });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const AuthData = await authService.loginAuthWithEmailAndPassword(email, password);
  const authtoken = await tokenService.generateUserToken(AuthData.id);
  const devicehash = req.headers.devicehash;
  const devicetype = req.headers.devicetype;
  const fcmtoken = req.headers.fcmtoken;
  await tokenService.addDeviceHandler(AuthData.id, authtoken, '1.1.1.1', devicehash, devicetype, fcmtoken);
  res.status(httpStatus.OK).json({ AuthData, authtoken });
});

const logout = catchAsync(async (req, res) => {
  await tokenService.logoutdevice(req.body.authtoken);
  res.status(httpStatus.NO_CONTENT).json();
});

const changePassword = catchAsync(async (req, res) => {
  const oldPassword = req.body.oldpassword;
  const newPassword = req.body.newpassword;
  const token = checkHeader(req);
  await authService.changeAuthPassword(oldPassword, newPassword, token, req.SubjectId);
  res.status(httpStatus.OK).json({ message: 'Password Changed Successfully' });
});

const forgotPassword = catchAsync(async (req, res) => {
  const service = req.body.choice;
  const AuthData = await authService.getAuthByEmail(req.body.email);
  const OTP = generateOTP();
  if (service === 'email') {
    await emailService.sendResetPasswordEmail(req.body.value, OTP);
    res.status(httpStatus.OK).json({ message: 'Reset Code Sent to Registered EmailID' });
  }
  await otpServices.sendresetpassotp(OTP, AuthData);
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body.email, req.body.resetcode, req.body.newpassword);
  res.status(httpStatus.OK).json({ message: 'Password Reset Successfull' });
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const OTP = generateOTP();
  await emailService.sendVerificationEmail(AuthData.email, OTP);
  await otpServices.sendemailverifyotp(OTP, AuthData);
  res.status(httpStatus.OK).json({ message: 'Enter OTP sent over Email' });
});

const verifyEmail = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await otpServices.verifyEmailOtp(req.body.emailcode, AuthData);
  res.status(httpStatus.OK).json({ message: 'Email Verified' });
});

const requestOtp = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const OTP = generateOTP();
  await otpServices.sendphoneverifyotp(OTP, AuthData);
  res.status(httpStatus.OK).json({ message: 'OTP Sent over Phone' });
});

const verifyPhone = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await otpServices.verifyPhoneOtp(req.body.otp, AuthData);
  res.status(httpStatus.OK).json({ message: 'Phone Number Verified' });
});

const resendOtp = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const OTP = generateOTP();
  await otpServices.resendOtp(OTP, AuthData);
  res.status(httpStatus.OK).json({ message: 'OTP sent over Phone' });
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
