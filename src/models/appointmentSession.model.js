const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const AppointmentSessionSchema = mongoose.Schema(
  {
    AuthDoctor: {
      type: String,
      required: true,
    },
    docid: {
      type: Number,
      required: true,
    },
    AuthUser: {
      type: String,
      required: true,
    },
    Status: {
      type: String,
      default: 'SCHEDULED',
    },
    Type: {
      type: String,
      default: 'PB',
    },
  },
  {
    timestamps: true,
  }
);
// add plugin that converts mongoose to json
AppointmentSessionSchema.plugin(toJSON);
/**
 * @typedef AppointmentSession
 */
const AppointmentSession = mongoose.model('AppointmentSession', AppointmentSessionSchema);
module.exports = AppointmentSession;
