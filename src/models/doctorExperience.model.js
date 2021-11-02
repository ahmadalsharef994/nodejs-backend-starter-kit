const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');

const DoctorExperienceSchema = mongoose.Schema(
  {
    mainstream: {
      type: String,
      required: true,
      trim: true,
    },
    specialization: {
      type: Array,
      required: true,
      trim: true,
    },
    experience: {
      type: Number,
      default: 0,
    },
    isExperienceVerified: {
      type: Boolean,
      default: false,
    },
    skills: {
      type: Array,
      required: true,
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
DoctorExperienceSchema.plugin(toJSON);

/**
 * @typedef DoctorExperienceSchema
 */
const DoctorExperience = mongoose.model('DoctorExperience', DoctorExperienceSchema);

module.exports = DoctorExperience;
