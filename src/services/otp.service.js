const httpStatus = require('http-status');
const { Otp } = require('../models');
const ApiError = require('../utils/ApiError');

const sendresetpassotp = async (OTP, user) => {
  const authDataExist = await Otp.findOne({ user: user });
  if (authDataExist) {
    const OtpDoc = await Otp.updateOne({ _id: authDataExist._id }, { $set: { resetPasswordVerify: OTP } });
    return OtpDoc;
  }
  else {
    const OtpDoc = await Otp.create({ resetPasswordVerify: OTP, user: user });
    return OtpDoc;
  }
}

const sendemailverifyotp = async (OTP, user) => {
  const authDataExist = await Otp.findOne({ user: user });
  if (authDataExist) {
    const OtpDoc = await Otp.updateOne({ _id: authDataExist._id }, { $set: { emailVerify: OTP } });
    return OtpDoc;
  }
  else {
    const OtpDoc = await Otp.create({ emailVerify: OTP, user: user });
    return OtpDoc;
  }
}

const sendphoneverifyotp = async (OTP, user) => {
  const authDataExist = await Otp.findOne({ user: user });
  if (authDataExist) {
    const OtpDoc = await Otp.updateOne({ _id: authDataExist._id }, { $set: { phoneVerify: OTP } });
    return OtpDoc;
  }
  else {
    const OtpDoc = await Otp.create({ phoneVerify: OTP, user: user });
    return OtpDoc;
  }
};

const verifyEmailOtp = async (emailcode, AuthData) => {
  const OtpDoc = await Otp.findOne({ user: AuthData });
  if (emailcode == OtpDoc.emailVerify) {
    return OtpDoc;
  }
  else{
    throw new ApiError(httpStatus.BAD_REQUEST,"Incorrect OTP")
  }
};
const verifyForgetPasswordOtp = async (resetcode, AuthData) => {
  const OtpDoc = await Otp.findOne({ user: AuthData });
  if (resetcode == OtpDoc.resetPasswordVerify) {
    return OtpDoc;
  }
  else{
    throw new ApiError(httpStatus.BAD_REQUEST,"Incorrect OTP")
  }
};

const verifyPhoneOtp = async (otp, AuthData) => {
  const OtpDoc = await Otp.findOne({ user: AuthData });
  if (otp == OtpDoc.phoneVerify) {
    return OtpDoc;
  }
  else{
    throw new ApiError(httpStatus.BAD_REQUEST,"Incorrect OTP")
  }
};

const resendOtp = async (OTP, user) => {
  const authDataExist = await Otp.findOne({ user: user });
  if (authDataExist) {
    const OtpDoc = await Otp.updateOne({ _id: authDataExist._id }, { $set: { phoneVerify: OTP } });
    return OtpDoc;
  }
  else {
    throw new ApiError(httpStatus.BAD_REQUEST,"You are being Monitored")
  }
};

module.exports = {
  verifyEmailOtp,
  verifyForgetPasswordOtp,
  verifyPhoneOtp,
  resendOtp,
  sendphoneverifyotp,
  sendemailverifyotp,
  sendresetpassotp,
};
