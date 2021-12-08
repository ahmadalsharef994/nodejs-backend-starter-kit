const axios = require('axios');
// const otpGenerator = require('otp-generator');

const sendPhoneOtp2F = async (phoneNo, OTP, template = 'Login Verification') => {
  const res = await axios.get(`https://2factor.in/API/V1/${process.env.TWOFACTOR_API}/SMS/+91${phoneNo}/${OTP}/${template}`);
  return res;
};

const verifyPhoneOtp2F = async (userOTP, sessionId) => {
  const res = await axios.get(`https://2factor.in/API/V1/${process.env.TWOFACTOR_API}/SMS/VERIFY/${sessionId}/${userOTP}`);
  return res;
};

module.exports = {
  sendPhoneOtp2F,
  verifyPhoneOtp2F,
};
