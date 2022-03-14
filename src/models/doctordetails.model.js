const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');

const DoctorDetailsSchema = mongoose.Schema(
  {
    specializations: {
      type: Array,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    doctorauthId: {
      type: String,
      required: true,
    },
    Experience: {
      type: Number,
      required: true,
    },
    doctorDegree: {
      type: String,
      required: true,
    },
    doctorClinicAddress: {
      type: String,
      required: true,
    },
    appointmentPrice: {
      type: Number,
      required: true,
    },
    doctorId: {
      type: Number,
      required: true,
    },
    Adminauth: {
      type: String,
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
DoctorDetailsSchema.plugin(toJSON);

/**
 * @typedef DoctorDetails
 */
const doctordetails = mongoose.model('doctordetails', DoctorDetailsSchema);

module.exports = doctordetails;
