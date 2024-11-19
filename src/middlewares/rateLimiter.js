const rateLimit = require('express-rate-limit');
const config = require('../config/config');

let maxAuthLimiter = 10;
let maxOTPLimiter = 3;

if (config.env === 'development') {
  maxAuthLimiter = 50;
  maxOTPLimiter = 10;
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: maxAuthLimiter,
  skipSuccessfulRequests: true,
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: maxOTPLimiter,
  skipSuccessfulRequests: false,
});

module.exports = {
  authLimiter,
  otpLimiter,
};
