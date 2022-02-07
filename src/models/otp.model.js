const mongoose = require('../../node_modules/mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');

const otpSchema = mongoose.Schema(
  {
    phoneOtp: {
      type: Number,
      default: null,
    },
    phoneOtpTimestamp: {
      type: Date,
      default: null,
    },
    emailOtp: {
      type: Number,
      default: null,
    },
    emailOtpTimestamp: {
      type: Date,
      default: null,
    },
    resetPasswordOtp: {
      type: Number,
      default: null,
    },
    resetPasswordOtpTimestamp: {
      type: Date,
      default: null,
    },
    auth: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Auth,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
otpSchema.plugin(toJSON);

/**
 * @typedef otp
 */
const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
