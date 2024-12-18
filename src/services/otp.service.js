const httpStatus = require('http-status');
const { Otp, Auth } = require('../models');
const ApiError = require('../utils/ApiError');
const { smsService } = require('../Microservices');

const initiateOTPData = async (user) => {
  const authDataExist = await Otp.findOne({ auth: user });
  if (!authDataExist) {
    const OtpDoc = await Otp.create({ auth: user });
    return OtpDoc;
  }
  throw new ApiError(400, 'Something went Wrong!');
};

const sendResetPassOtp = async (OTP, user) => {
  const authDataExist = await Otp.findOne({ auth: user });
  if (authDataExist) {
    const OtpDoc = await Otp.updateOne(
      { _id: authDataExist._id },
      { $set: { resetPasswordOtp: OTP, resetPasswordOtpTimestamp: new Date() } }
    );
    return OtpDoc;
  }
  const OtpDoc = await Otp.create({ resetPasswordOtp: OTP, auth: user, resetPasswordOtpTimestamp: new Date() });
  return OtpDoc;
};

const sendEmailVerifyOtp = async (OTP, user) => {
  const authDataExist = await Otp.findOne({ auth: user });
  if (authDataExist) {
    const OtpDoc = await Otp.updateOne(
      { _id: authDataExist._id },
      { $set: { emailOtp: OTP, emailOtpTimestamp: new Date() } }
    );
    return OtpDoc;
  }
  const OtpDoc = await Otp.create({ emailOtp: OTP, auth: user, emailOtpTimestamp: new Date() });
  return OtpDoc;
};

const sendPhoneVerifyOtp = async (OTP, user) => {
  const response2F = await smsService.sendPhoneOtp2F(user.mobile, OTP);
  if (response2F.data.Status !== 'Success') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Request Phone OTP Failed');
  }
  const authDataExist = await Otp.findOne({ auth: user });
  if (authDataExist) {
    const OtpDoc = await Otp.updateOne(
      { _id: authDataExist._id },
      { $set: { phoneOtp: OTP, phoneOtpTimestamp: new Date() } }
    );
    return OtpDoc;
  }
  const OtpDoc = await Otp.create({ phoneOtp: OTP, auth: user, phoneOtpTimestamp: new Date() });
  return OtpDoc;
};

const verifyEmailOtp = async (emailcode, authId) => {
  const OtpDoc = await Otp.findOne({ auth: authId });
  if (!OtpDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Request OTP Before Verifying It');
  }
  const time = new Date().getTime() - OtpDoc.emailOtpTimestamp.getTime();

  if (time > 180000) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP Expired!');
  }

  if (emailcode === OtpDoc.emailOtp) {
    await Auth.updateOne({ _id: OtpDoc.auth }, { $set: { isEmailVerified: true } });
    return OtpDoc;
  }

  throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect OTP');
};

const verifyForgetPasswordOtp = async (resetcode, AuthData) => {
  const OtpDoc = await Otp.findOne({ auth: AuthData });
  if (!OtpDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Request OTP Before Verifying It');
  }
  const time = new Date().getTime() - OtpDoc.resetPasswordOtpTimestamp.getTime();

  if (time > 180000) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP Expired!');
  }

  if (resetcode === OtpDoc.resetPasswordOtp) {
    return OtpDoc;
  }

  throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect OTP');
};

const verifyPhoneOtp = async (otp, AuthData) => {
  const OtpDoc = await Otp.findOne({ auth: AuthData });
  if (!OtpDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Request OTP Before Verifying It');
  }
  const time = new Date().getTime() - OtpDoc.phoneOtpTimestamp.getTime();

  if (time > 120000) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP Expired!');
  }

  if (otp === OtpDoc.phoneOtp) {
    await Auth.updateOne({ _id: AuthData._id }, { $set: { isMobileVerified: true } });
    return OtpDoc;
  }

  throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect OTP');
};

const resendOtp = async (OTP, user) => {
  const response2F = await smsService.sendPhoneOtp2F(user.mobile, 40, OTP);
  if (response2F.data.Status !== 'Success') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Request Phone OTP Failed');
  }
  const authData = await Otp.findOne({ auth: user });
  if (authData) {
    const OtpDoc = await Otp.updateOne({ _id: authData._id }, { $set: { phoneOtp: OTP, phoneOtpTimestamp: new Date() } });
    return OtpDoc;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'You are being Monitored');
};

const changeEmail = async (email, user) => {
  const authDataExist = await Auth.findOne({ email });
  if (!authDataExist) {
    const checkEmailVerified = await Auth.findOne({ _id: user._id, isEmailVerified: true });
    if (checkEmailVerified === null) {
      await Auth.updateOne({ _id: user._id }, { $set: { email } });
      return 'Sucessfully Updated';
    }
    return false;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already taken');
};

const changePhone = async (mobile, user) => {
  const authDataExist = await Auth.findOne({ mobile });
  if (!authDataExist) {
    const checkemailverified = await Auth.findOne({ _id: user._id, isMobileVerified: true });
    if (checkemailverified === null) {
      await Auth.updateOne({ _id: user._id }, { $set: { mobile } });
      return 'Sucessfully Updated';
    }
    return false;
  }

  throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number is already taken');
};

module.exports = {
  initiateOTPData,
  sendPhoneVerifyOtp,
  sendEmailVerifyOtp,
  sendResetPassOtp,
  verifyEmailOtp,
  verifyForgetPasswordOtp,
  verifyPhoneOtp,
  resendOtp,
  changeEmail,
  changePhone,
};
