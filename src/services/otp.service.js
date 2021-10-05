const httpStatus = require('http-status');
const { Otp, Auth } = require('../models');
const ApiError = require('../utils/ApiError');

const sendresetpassotp = async (OTP, user) => {
  const authDataExist = await Otp.findOne({ auth: user });
  if (authDataExist) {
    const OtpDoc = await Otp.updateOne(
      { _id: authDataExist._id },
      { $set: { resetPasswordOtpVerify: OTP, resetPasswordOtpTimestamp: new Date() } }
    );
    return OtpDoc;
  }
  const OtpDoc = await Otp.create({ resetPasswordOtpVerify: OTP, auth: user, resetPasswordOtpTimestamp: new Date() });
  return OtpDoc;
};

const sendemailverifyotp = async (OTP, user) => {
  const authDataExist = await Otp.findOne({ auth: user });
  if (authDataExist) {
    const OtpDoc = await Otp.updateOne(
      { _id: authDataExist._id },
      { $set: { emailOtpVerify: OTP, emailOtpTimestamp: new Date() } }
    );
    return OtpDoc;
  }
  const OtpDoc = await Otp.create({ emailOtpVerify: OTP, auth: user, emailOtpTimestamp: new Date() });
  return OtpDoc;
};

const sendphoneverifyotp = async (OTP, user) => {
  const authDataExist = await Otp.findOne({ auth: user });
  if (authDataExist) {
    const OtpDoc = await Otp.updateOne(
      { _id: authDataExist._id },
      { $set: { phoneOtpVerify: OTP, phoneOtpTimestamp: new Date() } }
    );
    return OtpDoc;
  }
  const OtpDoc = await Otp.create({ phoneOtpVerify: OTP, auth: user, phoneOtpTimestamp: new Date() });
  return OtpDoc;
};

const verifyEmailOtp = async (emailcode, AuthData) => {
  const OtpDoc = await Otp.findOne({ auth: AuthData });
  const time = new Date().getTime() - OtpDoc.emailOtpTimestamp.getTime();
  // console.log(time/1000);    time in seconds
  if (time <= 180000 && emailcode === OtpDoc.emailOtpVerify) {
    await Auth.updateOne({ _id: AuthData._id }, { $set: { isEmailVerified: true } });
    return OtpDoc;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect OTP');
};

const verifyForgetPasswordOtp = async (resetcode, AuthData) => {
  const OtpDoc = await Otp.findOne({ auth: AuthData });
  const time = new Date().getTime() - OtpDoc.resetPasswordOtpTimestamp.getTime();
  if (time <= 180000 && resetcode === OtpDoc.resetPasswordOtpVerify) {
    return OtpDoc;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect OTP');
};

const verifyPhoneOtp = async (otp, AuthData) => {
  const OtpDoc = await Otp.findOne({ auth: AuthData });
  const time = new Date().getTime() - OtpDoc.phoneOtpTimestamp.getTime();
  if (time <= 180000 && otp === OtpDoc.phoneOtpVerify) {
    await Auth.updateOne({ _id: AuthData._id }, { $set: { isMobileVerified: true } });
    return OtpDoc;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect OTP');
};

const resendOtp = async (OTP, user) => {
  const authData = await Otp.findOne({ auth: user });
  if (authData) {
    const OtpDoc = await Otp.updateOne(
      { _id: authData._id },
      { $set: { phoneOtpVerify: OTP, phoneOtpTimestamp: new Date() } }
    );
    return OtpDoc;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'You are being Monitored');
};

const changeEmail = async (email, user) => {
  const authDataExist = await Auth.findOne({ email });
  if (!authDataExist) {
    const checkEmailVerified = await Auth.findOne({ isEmailVerified: true });
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
    const checkemailverified = await Auth.findOne({ isMobileVerified: true });
    if (checkemailverified === null) {
      await Auth.updateOne({ _id: user._id }, { $set: { mobile } });
      return 'Sucessfully Updated';
    }
    return false;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number is already taken');
};

module.exports = {
  sendphoneverifyotp,
  sendemailverifyotp,
  sendresetpassotp,
  verifyEmailOtp,
  verifyForgetPasswordOtp,
  verifyPhoneOtp,
  resendOtp,
  changeEmail,
  changePhone,
};
