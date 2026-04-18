import rateLimit from "express-rate-limit";
import config from "../config/config.js";

let maxAuthLimiter = 10;
let maxOTPLimiter = 3;

if (config.env === "development") {
  maxAuthLimiter = 50;
  maxOTPLimiter = 10;
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: maxAuthLimiter,
  skipSuccessfulRequests: true,
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: maxOTPLimiter,
  skipSuccessfulRequests: false,
});

export { authLimiter, otpLimiter };
