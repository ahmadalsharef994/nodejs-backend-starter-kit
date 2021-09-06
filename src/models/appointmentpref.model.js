const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const AppointmentPrefSchema = mongoose.Schema(
  {
    _id: { //verifieddocid
      type: String,
      required: true,
      default: null,
    },
    MON_A: {
      type: Array,
      default: null
    },
    TUE_A: {
      type: Array,
      default: null
    },
    WED_A: {
      type: Array,
      default: null
    },
    THU_A: {
      type: Array,
      default: null
    },
    FRI_A: {
      type: Array,
      default: null
    },
    SAT_A: {
      type: Array,
      default: null
    },
    SUN_A: {
      type: Array,
      default: null
    },
    MON_F: {
      type: Array,
      default: null
    },
    TUE_F: {
      type: Array,
      default: null
    },
    WED_F: {
      type: Array,
      default: null
    },
    THU_F: {
      type: Array,
      default: null
    },
    FRI_F: {
      type: Array,
      default: null
    },
    SAT_F: {
      type: Array,
      default: null
    },
    SUN_F: {
      type: Array,
      default: null
    }
  },
  {
    versionKey: false, timestamps: true, _id: false
  }
);

// add plugin that converts mongoose to json
AppointmentPrefSchema.plugin(toJSON);

const AppointmentPref = mongoose.model('AppointmentPref', AppointmentPrefSchema);
module.exports = AppointmentPref;
