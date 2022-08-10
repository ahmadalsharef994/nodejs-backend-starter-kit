const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const DyteSessionSchema = mongoose.Schema(
  {
    appointmentid: {
      type: String,
      required: true,
    },
    AuthDoctor: {
      type: String,
      required: true,
    },
    AuthUser: {
      type: String,
      required: true,
    },
    dytedoctortoken: {
      type: String,
      required: true,
    },
    dytemeetingid: {
      type: String,
      required: true,
    },
    dyteusertoken: {
      type: String,
      required: true,
    },
    dyteroomname: {
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
