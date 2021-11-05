const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');

const doctorClinic = mongoose.Schema(
  {
    clinicName: {
      type: String,
      required: true,
      default: null,
    },
    AddressFirstline: {
      type: String,
      required: true,
    },
    AddressSecondline: {
      type: String,
      required: true,
    },
    clinicTelephone: {
      type: Number,
      required: true,
    },
    pincode: {
      type: Number,
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
doctorClinic.plugin(toJSON);

/**
 * @typedef DoctorClinic
 */
const DoctorClinic = mongoose.model('DoctorClinic', doctorClinic);

module.exports = DoctorClinic;
