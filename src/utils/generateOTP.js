const generateOTP = () => {
  const OTP = Math.floor(
    Math.random() * (999999 - 100000 + 1) + 100000
  )
  return OTP;
};
module.exports = generateOTP;
