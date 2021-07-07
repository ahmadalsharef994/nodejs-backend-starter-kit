const { Otp } = require('../models');

const saveOtp = async (phoneVerify, emailVerify, resetPasswordVerify, user) => {
  const OtpDoc = await Otp.create({
    phoneVerify,
    emailVerify,
    resetPasswordVerify,
    user,
  });
  return OtpDoc;
};

const verifyEmailOtp = async (emailVerify, AuthData) => {
  const OtpDoc = await Otp.findOne({ emailVerify, user: AuthData });
  if (!OtpDoc) {
    throw new Error('Otp not found');
  }
  return OtpDoc;
};
const verifyForgetPasswordOtp = async (resetPasswordVerify, AuthData) => {
  const OtpDoc = await Otp.findOne({ resetPasswordVerify, user: AuthData });
  if (!OtpDoc) {
    throw new Error('Otp not found');
  }
  return OtpDoc;
};

const verifyPhoneOtp = async (phoneVerify, AuthData) => {
  const OtpDoc = await Otp.findOne({ phoneVerify, user: AuthData });
  if (!OtpDoc) {
    throw new Error('Otp not found');
  }
  return OtpDoc;
};
const resentOtp = async (phoneVerify, AuthData) => {
  Otp.findOne({ user: AuthData })
    .then(() => Otp.updateOne({ user: AuthData }, { $set: { phoneVerify } }))
    .then(() => Otp.findOne({ phoneVerify }))
    .then((doc) => {
      return doc;
    })
    .catch((err) => {
      return err;
    });
};
module.exports = {
  saveOtp,
  verifyEmailOtp,
  verifyForgetPasswordOtp,
  verifyPhoneOtp,
  resentOtp,
};
