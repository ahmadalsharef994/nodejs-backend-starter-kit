import crypto from 'crypto';
import { OTP } from '../models/index.js';
import { sendOTPEmail } from './email.service.js';
import { sendOTPSMS } from './sms.service.js';
import ApiError from '../utils/ApiError.js';
import httpStatus from 'http-status';
import logger from '../config/appLogger.js';

/**
 * Generate a random OTP
 * @param {number} length
 * @returns {string}
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

/**
 * Create and send OTP
 * @param {ObjectId} userId
 * @param {string} type - 'email', 'phone', 'resetPassword'
 * @param {string} recipient - email or phone number
 * @returns {Promise<Object>}
 */
const createAndSendOTP = async (userId, type, recipient) => {
  try {
    // Delete any existing OTP for this user and type
    await OTP.deleteMany({ user: userId, type, isUsed: false });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to database
    const otpDoc = await OTP.create({
      user: userId,
      otp,
      type,
      expiresAt,
    });

    // Send OTP based on type
    if (type === 'email' || type === 'resetPassword') {
      await sendOTPEmail(recipient, otp);
    } else if (type === 'phone') {
      await sendOTPSMS(recipient, otp);
    }

    logger.info(`OTP sent successfully to ${recipient} for user ${userId}`);
    
    return {
      success: true,
      message: 'OTP sent successfully',
      expiresAt,
    };
  } catch (error) {
    logger.error(`Failed to send OTP to ${recipient}: ${error.message}`);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send OTP');
  }
};

/**
 * Verify OTP
 * @param {ObjectId} userId
 * @param {string} otp
 * @param {string} type
 * @returns {Promise<boolean>}
 */
const verifyOTP = async (userId, otp, type) => {
  try {
    const otpDoc = await OTP.findOne({
      user: userId,
      type,
      isUsed: false,
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'OTP not found or already used');
    }

    if (otpDoc.expiresAt < new Date()) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'OTP has expired');
    }

    if (otpDoc.attempts >= otpDoc.maxAttempts) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Maximum OTP attempts exceeded');
    }

    // Increment attempts
    otpDoc.attempts += 1;
    await otpDoc.save();

    if (otpDoc.otp !== otp) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
    }

    // Mark OTP as used
    otpDoc.isUsed = true;
    await otpDoc.save();

    logger.info(`OTP verified successfully for user ${userId}`);
    return true;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error(`Failed to verify OTP for user ${userId}: ${error.message}`);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to verify OTP');
  }
};

export {
  generateOTP,
  createAndSendOTP,
  verifyOTP,
};
