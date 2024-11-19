const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');

const AppointmentPrefSchema = mongoose.Schema(
  {
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
