const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');

const DoctorBasicSchema = mongoose.Schema(
  {
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
    pin: {
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
 * @typedef DoctorBasic
 */
const DoctorBasic = mongoose.model('DoctorBasic', DoctorBasicSchema);

module.exports = DoctorBasic;
