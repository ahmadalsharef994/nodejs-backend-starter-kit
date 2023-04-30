const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');
const Wallet = require('./wallet.model');

const DoctorBasicSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    appointmentPrice: {
      type: Number,
    },
    gender: {
      type: String,
    },
    dob: {
      type: Date,
    },
    languages: {
      type: Array,
      default: 'EN',
    },
    state: {
      type: String,
    },
    pincode: {
      type: Number,
    },
    avatar: {
      type: String,
      default: null,
    },
    // thumbnail: {
    //   type: String,
    //   default: null,
    // },
    about: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: null,
    },
    doctorAuthId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Auth,
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Wallet,
    },
    serviceCharges: {
      type: Number,
      default: 0.1,
    },
    clinicName: {
      type: String,
      default: null,
    },
    clinicAddress: {
      type: String,
      default: null,
    },
    clinicTiming: {
      type: Array,
      default: null,
    },
    clinicTelephone: {
      type: Number,
      default: null,
    },
    registrationNo: {
      type: String,
    },
    yearofRegistration: {
      type: Number,
    },
    stateMedicalCouncil: {
      type: String,
    },
    mainstream: {
      type: String,
      trim: true,
    },
    specialization: {
      type: Array,
      trim: true,
    },
    specializations: {
      type: Array,
      required: true,
    },
    experience: {
      type: Number,
      default: 0,
    },
    skills: {
      type: Array,
    },
    isBasicDetailsVerified: {
      type: Boolean,
      default: false,
    },
    isEducationVerified: {
      type: Boolean,
      default: false,
    },
    isExperienceVerified: {
      type: Boolean,
      default: false,
    },
    isDoctorVerified: {
      type: Boolean,
      default: false,
    },
    verifiedDoctorId: {
      type: String,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Auth,
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
DoctorBasicSchema.plugin(toJSON);

/**
 * @typedef DoctorBasic
 */
const DoctorBasic = mongoose.model('DoctorBasic', DoctorBasicSchema);

module.exports = DoctorBasic;
