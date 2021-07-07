const mongoose = require('../../node_modules/mongoose');
const { toJSON } = require('./plugins');
const User = require('./user.model');

const otpSchema = mongoose.Schema(
  {
    phoneVerify: {
      type: Number,
      default: null,
    },
    emailVerify: {
      type: Number,
      default: null,
    },
    resetPasswordVerify: {
      type: Number,
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
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
