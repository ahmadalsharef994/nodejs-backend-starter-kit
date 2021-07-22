const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');

const DoctorBasicSchema = mongoose.Schema(
  {
    gender: {
      type: String,
      required: true,
      default: null,
    },
    dob: {
      type: Date,
      required: true,
    },
    languages: {
      type: Array,
      default: "EN",
    },
    city: {
      type: String,
      required: true,
    },
    isBasicDetailsVerified: {
      type: Boolean,
      default: false,
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
DoctorBasicSchema.plugin(toJSON);

/**
 * @typedef otp
 */
const DoctorBasic = mongoose.model('DoctorBasic', DoctorBasicSchema);

module.exports = DoctorBasic;
