const otpGenerator = require('otp-generator')

const sendOtp = () => {
const OTP =otpGenerator.generate(6, { upperCase: false, specialChars: false , alphabets:false });
    return(OTP);
};
  
  
module.exports = sendOtp;
  