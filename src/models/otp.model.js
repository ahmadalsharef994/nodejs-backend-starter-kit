const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const otpSchema = mongoose.Schema(
  {
    otp: {
      type: Number,
      required: true,
      index: true,
    },
    emailverify:{
        type: Number,
        required: true,
        index: true,
    },
    ResetPassverify:{
        type: Number,
        required: true,
        index: true,
    },
    User:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auth'
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
tokenSchema.plugin(toJSON);

/**
 * @typedef otp
 */
const otp = mongoose.model('otp', otpSchema);

module.exports = otp;
