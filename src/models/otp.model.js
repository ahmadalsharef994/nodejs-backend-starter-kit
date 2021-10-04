const mongoose = require('../../node_modules/mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');

const otpSchema = mongoose.Schema(
  {
    phoneVerify: {
      type: Number,
      default: null,
    },
    phoneTimestamp: {
      type: Date,
      default: null,
    },
    emailVerify: {
      type: Number,
      default: null,
    },
    emailTimestamp: {
      type: Date,
      default: null,
    },
    resetPasswordVerify: {
      type: Number,
      default: null,
    },
    resetPasswordTimestamp: {
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
