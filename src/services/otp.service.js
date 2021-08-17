const httpStatus = require('http-status');
const { Otp, Auth } = require('../models');
const ApiError = require('../utils/ApiError');

const sendresetpassotp = async (OTP, user) => {
  const authDataExist = await Otp.findOne({ auth: user });
  if (authDataExist) {
    const OtpDoc = await Otp.updateOne({ _id: authDataExist._id }, { $set: { resetPasswordVerify: OTP } });
    return OtpDoc;
  }

  const OtpDoc = await Otp.create({ resetPasswordVerify: OTP, auth: user });
  return OtpDoc;
};

const sendemailverifyotp = async (OTP, user) => {
  const authDataExist = await Otp.findOne({ auth: user });
  if (authDataExist) {
    const OtpDoc = await Otp.updateOne({ _id: authDataExist._id }, { $set: { emailVerify: OTP } });
    return OtpDoc;
  }

  const OtpDoc = await Otp.create({ emailVerify: OTP, auth: user });
  return OtpDoc;
};

const sendphoneverifyotp = async (OTP, user) => {
  const authDataExist = await Otp.findOne({ auth: user });
  if (authDataExist) {
    const OtpDoc = await Otp.updateOne({ _id: authDataExist._id }, { $set: { phoneVerify: OTP } });
    return OtpDoc;
  }

  const OtpDoc = await Otp.create({ phoneVerify: OTP, auth: user });
  return OtpDoc;
};

const verifyEmailOtp = async (emailcode, AuthData) => {
  const OtpDoc = await Otp.findOne({ auth: AuthData });
  if (emailcode == OtpDoc.emailVerify) {
    await Auth.updateOne({ _id: AuthData._id }, { $set: { isEmailVerified: true } });
    return OtpDoc;
  }

  throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect OTP');
};

const verifyForgetPasswordOtp = async (resetcode, AuthData) => {
  const OtpDoc = await Otp.findOne({ auth: AuthData });
  if (resetcode == OtpDoc.resetPasswordVerify) {
    return OtpDoc;
  }

  throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect OTP');
};

const verifyPhoneOtp = async (otp, AuthData) => {
  const OtpDoc = await Otp.findOne({ auth: AuthData });
  if (otp == OtpDoc.phoneVerify) {
    await Auth.updateOne({ _id: AuthData._id }, { $set: { isMobileVerified: true } });
    return OtpDoc;
  }

  throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect OTP');
};

const resendOtp = async (OTP, user) => {
  const authDataExist = await Otp.findOne({ auth: user });
  if (authDataExist) {
    const OtpDoc = await Otp.updateOne({ _id: authDataExist._id }, { $set: { phoneVerify: OTP } });
    return OtpDoc;
  }

  throw new ApiError(httpStatus.BAD_REQUEST, 'You are being Monitored');
};

module.exports = {
  sendphoneverifyotp,
  sendemailverifyotp,
  sendresetpassotp,
  verifyEmailOtp,
  verifyForgetPasswordOtp,
  verifyPhoneOtp,
  resendOtp,
};
