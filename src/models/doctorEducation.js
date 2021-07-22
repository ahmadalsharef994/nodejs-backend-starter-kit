const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');

const DoctorEducationSchema = mongoose.Schema(
  {
    mainstream: {
      type: String,
      required: true,
      trim: true,
    },
    speciality: {
      type: Array,
      required: true,
      trim: true,
    },
    skills: {
      type: Array,
      required: true,
      default: null,
    },
    experience: {
      type: Number,
      default: 0,
    },
    isEducationVerified: {
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
DoctorEducationSchema.plugin(toJSON);

/**
 * @typedef otp
 */
const DoctorEducation = mongoose.model('DoctorEducation', DoctorEducationSchema);

module.exports = DoctorEducation;
