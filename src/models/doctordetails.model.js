const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const Auth = require('./auth.model');

const DoctorDetailsSchema = mongoose.Schema(
  {
    specializations: {
      type: Array,
      required: true,
    },
    doctorname: {
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
      // to be changed to doctorVerifiedId
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
    Languages: {
      type: Array,
      default: 'EN',
    },
    Gender: {
      type: String,
      required: true,
    },
    Slots: {
      MON: {
        type: Array,
        default: null,
      },
      TUE: {
        type: Array,
        default: null,
      },
      WED: {
        type: Array,
        default: null,
      },
      THU: {
        type: Array,
        default: null,
      },
      FRI: {
        type: Array,
        default: null,
      },
      SAT: {
        type: Array,
        default: null,
      },
      SUN: {
        type: Array,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
DoctorDetailsSchema.plugin(toJSON);
DoctorDetailsSchema.plugin(paginate);

/**
 * @typedef DoctorDetails
 */
const doctordetails = mongoose.model('doctordetails', DoctorDetailsSchema);

module.exports = doctordetails;
