const httpStatus = require('http-status');
const config = require('../config/config');
const userService = require('./user.service');
const { Otp } = require('../models');

const saveOtp = async ( phoneVerify ,emailVerify,resetPasswordVerify,user) => {
  const OtpDoc = await Otp.create({
    phoneVerify,
    emailVerify,
    resetPasswordVerify,
    user,
  });
  return OtpDoc;
};


const verifyEmailOtp = async (emailVerify,AuthData) => {
const OtpDoc = await Otp.findOne({emailVerify:emailVerify,user:AuthData})
if (!OtpDoc) {
  throw new Error('Otp not found');
}
return OtpDoc;
};
    
const verifyForgetPasswordOtp = async (resetPasswordVerify,AuthData) => {
const OtpDoc = await Otp.findOne({resetPasswordVerify:resetPasswordVerify,user:AuthData})
if (!OtpDoc) {
  throw new Error('Otp not found');
}
return OtpDoc;
};


const verifyPhoneOtp = async (phoneVerify,AuthData) => {
const OtpDoc = await Otp.findOne({phoneVerify:phoneVerify,user:AuthData});
if (!OtpDoc) {
  throw new Error('Otp not found');
}
return OtpDoc;
};
      
  
const resentOtp = async (phoneVerify,AuthData) => {
   Otp.findOne({ user:AuthData })
  .then(doc => Otp.updateOne({ user: AuthData }, { $set: { phoneVerify: phoneVerify }}))
  .then(() => Otp.findOne({phoneVerify: phoneVerify }))
  .then(doc =>{ return doc})
  .catch(err =>{return err});
  
};
    




module.exports = {
  saveOtp,
  verifyEmailOtp,
  verifyForgetPasswordOtp,
  verifyPhoneOtp,
  resentOtp
  
};
