const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const AppointmentPreferenceSchema = mongoose.Schema(
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
    verifieddocid: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
AppointmentPreferenceSchema.plugin(toJSON);

/**
 * @typedef AppointmentPreference
 */
const AppointmentPreference = mongoose.model('AppointmentPreference', AppointmentPreferenceSchema);

module.exports = AppointmentPreference;
