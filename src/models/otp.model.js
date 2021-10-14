const mongoose = require('../../node_modules/mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');

const otpSchema = mongoose.Schema(
  {
    phoneOtpVerify: {
      type: Number,
      default: null,
    },
    phoneOtpTimestamp: {
      type: Date,
      default: null,
    },
    emailOtpVerify: {
      type: String,
      default: null,
    },
    emailOtpTimestamp: {
      type: Date,
      default: null,
    },
    resetPasswordOtpVerify: {
      type: String,
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
