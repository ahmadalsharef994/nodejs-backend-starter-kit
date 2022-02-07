const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const VerifiedUserSchema = mongoose.Schema(
  {
    mobile: {
      type: Number,
      required: true,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: Number,
      default: null,
    },
    otpTimestamp: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
VerifiedUserSchema.plugin(toJSON);

/**
 * @typedef VerifiedUser
 */

const VerifiedUser = mongoose.model('VerifiedUser', VerifiedUserSchema);

module.exports = VerifiedUser;
