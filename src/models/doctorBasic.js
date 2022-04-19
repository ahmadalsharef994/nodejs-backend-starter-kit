const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');
const Wallet = require('./wallet.model');

const DoctorBasicSchema = mongoose.Schema(
  {
    appointmentPrice: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    languages: {
      type: Array,
      default: 'EN',
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    isBasicDetailsVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    thumbnail: {
      type: String,
      default: null,
    },
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
    auth: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Auth,
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Wallet,
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
