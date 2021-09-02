const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const generateOTP = require('../utils/generateOTP');
const checkHeader = require('../utils/chechHeader');
const { authService, tokenService, otpServices, verifiedDoctorService } = require('../services');
const { emailService, smsService } = require('../Microservices');

const register = catchAsync(async (req, res) => {
  const AuthData = await authService.createAuthData(req.body);
  const authtoken = await tokenService.generateDoctorToken(AuthData.id);
  const devicehash = req.headers.devicehash;
  const devicetype = req.headers.devicetype;
  const fcmtoken = req.headers.fcmtoken;
  await tokenService.addDeviceHandler(AuthData.id, authtoken, '1.1.1.1', devicehash, devicetype, fcmtoken);
  res.status(httpStatus.CREATED).send({ AuthData, authtoken });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const AuthData = await authService.loginAuthWithEmailAndPassword(email, password);
  const verifiedcheckData = await verifiedDoctorService.checkVerification(AuthData._id);
  if (verifiedcheckData) {
    var authtoken = await tokenService.generateVerifiedDoctorToken(AuthData.id, verifiedcheckData.docid);
  } else {
    var authtoken = await tokenService.generateDoctorToken(AuthData.id);
  }
  const devicehash = req.headers.devicehash;
  const devicetype = req.headers.devicetype;
  const fcmtoken = req.headers.fcmtoken;
  await tokenService.addDeviceHandler(AuthData.id, authtoken, '1.1.1.1', devicehash, devicetype, fcmtoken);
  res.send({ AuthData, authtoken });
});

const logout = catchAsync(async (req, res) => {
  await tokenService.logoutdevice(req.body.authtoken);
  res.status(httpStatus.NO_CONTENT).send();
});

const changePassword = catchAsync(async (req, res) => {
  const oldPassword = req.body.oldpassword;
  const newPassword = req.body.newpassword;
  const token = checkHeader(req);
  await authService.changeAuthPassword(oldPassword, newPassword, token, req.SubjectId);
  res.status(200).json('Password Changed Successfully');
});

const forgotPassword = catchAsync(async (req, res) => {
  const service = req.body.choice ;
  const AuthData = await authService.getAuthByEmail(req.body.email);
  const OTP = generateOTP();
  if(service == 'email'){
    const result = await emailService.sendResetPasswordEmail(req.body.value, OTP);
    res.status(200).json('Reset Code Sent to Registered EmailID');
  }
  await otpServices.sendresetpassotp(OTP, AuthData);
  
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body.email, req.body.resetcode, req.body.newpassword);
  res.status(200).json('Password Reset Successfull');
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const OTP = generateOTP();
  await emailService.sendVerificationEmail(AuthData.email, OTP);
  await otpServices.sendemailverifyotp(OTP, AuthData);
  res.status(200).json('Enter OTP sent over Email');
});

const changeEmail = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const result = await otpServices.changeEmail(req.body.email, AuthData);
  if(result != false){
  res.status(200).json('email is updated sucessfully');
  }res.status(400).json('email is verified already');
});

const changePhone = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const result = await otpServices.changePhone(req.body.phone, AuthData);
  if(result != false){
  res.status(201).json('Phone is updated sucessfully');
  }res.status(400).json('Phone is verified already');
});

const verifyEmail = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await otpServices.verifyEmailOtp(req.body.emailcode, AuthData);
  res.status(200).json('Email Verified');
});

const requestOtp = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const OTP = generateOTP();
  await otpServices.sendphoneverifyotp(OTP, AuthData);
  res.status(200).json('OTP Sent over Phone');
});

const verifyPhone = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await otpServices.verifyPhoneOtp(req.body.otp, AuthData);
  res.status(200).json('Phone Number Verified');
});

const resendOtp = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const OTP = generateOTP();
  await otpServices.resendOtp(OTP, AuthData);
  res.status(200).json('OTP sent over Phone');
});

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  changeEmail,
  changePhone,
  changePassword,
  requestOtp,
  verifyPhone,
  resendOtp,
};
