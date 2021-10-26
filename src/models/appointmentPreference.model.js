const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');

const AppointmentPrefSchema = mongoose.Schema(
  {
    MON_A: {
      type: Array,
      default: null,
    },
    TUE_A: {
      type: Array,
      default: null,
    },
    WED_A: {
      type: Array,
      default: null,
    },
    THU_A: {
      type: Array,
      default: null,
    },
    FRI_A: {
      type: Array,
      default: null,
    },
    SAT_A: {
      type: Array,
      default: null,
    },
    SUN_A: {
      type: Array,
      default: null,
    },
    MON_F: {
      type: Array,
      default: null,
    },
    TUE_F: {
      type: Array,
      default: null,
    },
    WED_F: {
      type: Array,
      default: null,
    },
    THU_F: {
      type: Array,
      default: null,
    },
    FRI_F: {
      type: Array,
      default: null,
    },
    SAT_F: {
      type: Array,
      default: null,
    },
    SUN_F: {
      type: Array,
      default: null,
    },
    docid: {
      type: String,
      required: true,
      index: true,
    },
    doctorAuthId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Auth,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
AppointmentPrefSchema.plugin(toJSON);

/**
 * @typedef AppointmentPref
 */
const AppointmentPreference = mongoose.model('AppointmentPreference', AppointmentPrefSchema);

module.exports = AppointmentPreference;
