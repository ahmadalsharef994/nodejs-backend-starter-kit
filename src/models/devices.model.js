const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const deviceSchema = mongoose.Schema(
  {
    session: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Auth',
      index: true,
    },
    authtoken: {
      type: String,
      required: true,
    },
    loggedstatus: {
      type: String,
      default: true,
    },
    ipaddress: {
      type: String,
      required: true,
    },
    devicehash: {
      type: String,
      required: true,
    },
    devicetype: {
      type: String,
      required: true,
    },
    fcmtoken: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
deviceSchema.plugin(toJSON);

/**
 * @typedef Devices
 */
const Devices = mongoose.model('Devices', deviceSchema);

module.exports = Devices;
