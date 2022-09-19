const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');

const notification = mongoose.Schema(
  {
    auth: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Auth,
    },
    appNotifications: {
      type: Boolean,
      default: true,
    },
    promotionalEmails: {
      type: Boolean,
      default: true,
    },
    offersAndDiscounts: {
      type: Boolean,
      default: true,
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
