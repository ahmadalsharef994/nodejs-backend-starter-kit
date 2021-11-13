const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');

const notification = mongoose.Schema(
  {
    auth: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Auth,
    },
    appointmentNotification: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
notification.plugin(toJSON);

/**
 * @typedef Notification
 */
const Notification = mongoose.model('Notification', notification);

module.exports = Notification;
