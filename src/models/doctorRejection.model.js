const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');

const DoctorRejectionSchema = mongoose.Schema(
  {
    basicDetails: {
      type: Boolean,
      default: false,
      required: true,
    },
    educationDetails: {
      type: Boolean,
      default: false,
      required: true,
    },
    experienceDetails: {
      type: Boolean,
      default: false,
      required: true,
    },
    payoutdetails: {
      type: Boolean,
      default: false,
      required: true,
    },
    rejectionMsg: {
      type: String,
      required: true,
    },
    customMsg: {
      type: String,
      default: null,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Auth,
      required: true,
    },
    doctorAuthId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Auth,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
DoctorRejectionSchema.plugin(toJSON);
/**
 * @typedef DoctorRejection
 */

const DoctorRejection = mongoose.model('DoctorRejection', DoctorRejectionSchema);

module.exports = DoctorRejection;
