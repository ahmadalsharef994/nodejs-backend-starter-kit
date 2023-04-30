const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const DyteSessionSchema = mongoose.Schema(
  {
    appointmentId: {
      type: String,
      required: true,
    },
    doctorAuthId: {
      type: String,
      required: true,
    },
    userAuthId: {
      type: String,
      required: true,
    },
    doctorToken: {
      type: String,
      required: true,
    },
    meetingId: {
      type: String,
      required: true,
    },
    userToken: {
      type: String,
      required: true,
    },
    roomName: {
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
DyteSessionSchema.plugin(toJSON);
/**
 * @typedef DyteSession
 */
const DyteSession = mongoose.model('DyteSession', DyteSessionSchema);
module.exports = DyteSession;
