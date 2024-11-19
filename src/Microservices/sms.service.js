const axios = require('axios');
// const otpGenerator = require('otp-generator');

const sendPhoneOtp2F = async (phoneNo, isdcode, OTP, template = 'Login Verification') => {
  const res = await axios.get(
    `https://2factor.in/API/V1/${process.env.TWOFACTOR_API}/SMS/+${isdcode}${phoneNo}/${OTP}/${template}`
  );
  return res;
};

// used only for thyrocare guest bookings
const verifyPhoneOtp2F = async (userOTP, sessionId) => {
  const res = await axios.get(`https://2factor.in/API/V1/${process.env.TWOFACTOR_API}/SMS/VERIFY/${sessionId}/${userOTP}`);
  return res;
};

module.exports = {
  sendPhoneOtp2F,
  verifyPhoneOtp2F,
};
