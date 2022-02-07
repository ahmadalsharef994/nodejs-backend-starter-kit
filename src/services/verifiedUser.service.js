const httpStatus = require('http-status');
const { VerifiedUser } = require('../models');
const ApiError = require('../utils/ApiError');
const { smsService } = require('../Microservices');
const generateOTP = require('../utils/generateOTP');
const { authService } = require('.');

const getVerifiedUserByMobile = async (mobile) => {
  const VerificationExist = await VerifiedUser.findOne({ mobile });
  return VerificationExist;
};

const getVerifiedUserById = async (userId) => {
  const VerificationExist = await VerifiedUser.findOne({ _id: userId, isMobileVerified: true });
  return VerificationExist;
};

const createVerifiedUser = async (mobile) => {
  const userAuthExist = await authService.getAuthByPhone(mobile);
  if (userAuthExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Mobile Number Already Registered');
  }
  const OTP = generateOTP();
  const user = await VerifiedUser.create({ mobile, otp: OTP, otpTimestamp: new Date() });
  const response2F = await smsService.sendPhoneOtp2F(mobile, OTP);
  if (response2F.data.Status === 'Success') {
    return user.id;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Request Phone OTP Failed');
};

const resendVerifiedUserOtp = async (mobile) => {
  const userAuthExist = await authService.getAuthByPhone(mobile);
  if (userAuthExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Mobile Number Already Registered');
  }
  const OTP = generateOTP();
  const user = await VerifiedUser.findOneAndUpdate(
    { mobile },
    { $set: { otp: OTP, otpTimestamp: new Date() } },
    { new: true }
  );
  const response2F = await smsService.sendPhoneOtp2F(mobile, OTP);
  if (response2F.data.Status === 'Success') {
    return user.id;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Request Phone OTP Failed');
};

const verifyVerifiedUser = async (id, OTP) => {
  const verifiedUser = await VerifiedUser.findById(id);
  if (verifiedUser === null || verifiedUser.otp === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Request OTP Before Verifying It');
  }
  const time = new Date().getTime() - verifiedUser.otpTimestamp.getTime();
  if (time > 120000) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP Expired!');
  }
  if (OTP === verifiedUser.otp) {
    await VerifiedUser.findOneAndUpdate({ _id: id }, { $set: { isMobileVerified: true } }, { new: true });
    return verifiedUser.id;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Incorrect OTP');
};

module.exports = {
  getVerifiedUserByMobile,
  getVerifiedUserById,
  createVerifiedUser,
  resendVerifiedUserOtp,
  verifyVerifiedUser,
};
