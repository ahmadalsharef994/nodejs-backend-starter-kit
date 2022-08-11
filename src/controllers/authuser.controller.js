const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const generateOTP = require('../utils/generateOTP');
const checkHeader = require('../utils/chechHeader');
const googleStrategy = require('../utils/googleStrategy');
const { authService, tokenService, otpServices, verifiedUserService, userProfile } = require('../services');
const { emailService, smsService } = require('../Microservices');
const ApiError = require('../utils/ApiError');

const createUser = catchAsync(async (req, res) => {
  const userId = await verifiedUserService.createVerifiedUser(req.body.mobile);
  if (userId) {
    res.status(httpStatus.OK).json({ message: 'User Created successfully', userId });
  }
  res.status(httpStatus.BAD_REQUEST).json({ message: 'Create User Account Failed' });
});

const resendCreateUserOtp = catchAsync(async (req, res) => {
  const userId = await verifiedUserService.resendVerifiedUserOtp(req.body.mobile);
  if (userId) {
    return res.status(httpStatus.OK).json({ message: 'OTP Sent Successfully', userId });
  }
  res.status(httpStatus.BAD_REQUEST).json({ message: 'Resent OTP Failed' });
});

const verifyCreatedUser = catchAsync(async (req, res) => {
  const userId = await verifiedUserService.verifyVerifiedUser(req.body.userId, req.body.otp);
  if (userId) {
    res.status(httpStatus.OK).json({ message: 'User Mobile Number Verified Successfully', userId });
  }
  res.status(httpStatus.BAD_REQUEST).json({ message: 'User Mobile Number Verification Failed' });
});

const register = catchAsync(async (req, res) => {
  const { userId, email, password, fullname, dob, gender, pincode } = await req.body;
  const verifiedUser = await verifiedUserService.getVerifiedUserById(userId);
  if (verifiedUser) {
    const AuthData = await authService.createAuthData({
      email,
      password,
      fullname,
      mobile: verifiedUser.mobile,
      isMobileVerified: verifiedUser.isMobileVerified,
    });
    const basicDetails = await userProfile.submitBasicDetails({ dob, gender, pincode, userid: null }, AuthData);
    const authtoken = tokenService.generateUserToken(AuthData.id);
    const devicehash = req.headers.devicehash;
    const devicetype = req.headers.devicetype;
    // const fcmtoken = req.headers.fcmtoken;
    await tokenService.addDeviceHandler(AuthData.id, authtoken, req.ip4, devicehash, devicetype);
    await otpServices.initiateOTPData(AuthData);
    res.status(httpStatus.CREATED).json({ AuthData, basicDetails, authtoken });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Verify Your Mobile Number' });
  }
});

const login = catchAsync(async (req, res) => {
  const { username, password } = req.body;
  const AuthData = await authService.loginAuthWithEmailAndPassword(username, password);
  const authtoken = await tokenService.generateUserToken(AuthData.id);
  const devicehash = req.headers.devicehash;
  const devicetype = req.headers.devicetype;
  // const fcmtoken = req.headers.fcmtoken;
  await tokenService.addDeviceHandler(AuthData.id, authtoken, req.ip4, devicehash, devicetype);
  res.status(httpStatus.OK).json({ AuthData, authtoken });
});

const loginWithGoogle = catchAsync(async (req, res) => {
  const profileData = await googleStrategy();
  const AuthData = await authService.createGoogleAuthData(profileData);
  const authtoken = await tokenService.generateUserToken(AuthData.id);
  const devicehash = req.headers.devicehash;
  const devicetype = req.headers.devicetype;
  // const fcmtoken = req.headers.fcmtoken;
  await tokenService.addDeviceHandler(AuthData.id, authtoken, req.ip4, devicehash, devicetype);
  res.status(httpStatus.CREATED).json({ AuthData, authtoken });
});

const logout = catchAsync(async (req, res) => {
  await tokenService.logoutdevice(req.body.authtoken);
  res.status(httpStatus.OK).json({ message: 'logged out successfully' });
});

const changePassword = catchAsync(async (req, res) => {
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  const token = checkHeader(req);
  await authService.changeAuthPassword(oldPassword, newPassword, token, req.SubjectId);
  res.status(httpStatus.OK).json({ message: 'Password Changed Successfully' });
});

const forgotPassword = catchAsync(async (req, res) => {
  const service = req.body.choice;
  const OTP = generateOTP();
  if (service === 'email') {
    const AuthData = await authService.getAuthByEmail(req.body.email);
    if (!AuthData) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No account is registered using this email please provide correct email');
    }
    try {
      await emailService.sendResetPasswordEmail(req.body.email, AuthData.fullname, OTP);
      await otpServices.sendResetPassOtp(OTP, AuthData);
      res.status(httpStatus.OK).json({ message: 'Reset Code Sent to Registered Email ID' });
    } catch (err) {
      throw new ApiError(httpStatus.NOT_FOUND, `email service: ${err}`);
    }
  } else if (service === 'phone') {
    const AuthData = await authService.getAuthByPhone(parseInt(req.body.phone, 10));
    if (!AuthData) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No account is registered using this Phone please provide correct Phone');
    }
    try {
      const response2F = await smsService.sendPhoneOtp2F(req.body.phone, OTP);
      const dbresponse = await otpServices.sendResetPassOtp(OTP, AuthData);
      if (response2F && dbresponse) {
        res.status(httpStatus.OK).json({ message: 'Reset Code Sent to Registered Phone Number' });
      }
    } catch (err) {
      throw new ApiError(httpStatus.NOT_FOUND, `sms service: ${err}`);
    }
  }
});

const resetPassword = catchAsync(async (req, res) => {
  const service = req.body.choice;
  if (service === 'email') {
    const AuthData = await authService.getAuthByEmail(req.body.email);
    await authService.resetPassword(AuthData.email, req.body.resetcode, req.body.newPassword);
  } else if (service === 'phone') {
    const AuthData = await authService.getAuthByPhone(req.body.phone);
    await authService.resetPassword(AuthData.email, req.body.resetcode, req.body.newPassword);
  }
  res.status(httpStatus.OK).json({ message: 'Password Reset Successfull' });
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const OTP = generateOTP();
  const response = await emailService.sendVerificationEmail(AuthData.email, AuthData.fullname, OTP);
  if (response === true) {
    await otpServices.sendEmailVerifyOtp(OTP, AuthData);
    res.status(httpStatus.OK).json({ message: 'Email Verification Code Sent' });
  } else {
    res.status(httpStatus.BAD_GATEWAY).json({ message: 'Email Verification Not Sent ', response });
  }
});

const verifyEmail = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await otpServices.verifyEmailOtp(req.body.emailcode, AuthData);
  res.status(httpStatus.OK).json({ message: 'Email Verified' });
});

const requestOtp = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const OTP = generateOTP();
  await otpServices.sendPhoneVerifyOtp(OTP, AuthData);
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
  createUser,
  resendCreateUserOtp,
  verifyCreatedUser,
  register,
  login,
  loginWithGoogle,
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
