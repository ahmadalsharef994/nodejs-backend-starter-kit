const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const GuestSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    isPhoneOtpVerified: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
GuestSchema.plugin(toJSON);
GuestSchema.plugin(paginate);

/**
 * @typedef Guest
 */

const Guest = mongoose.model('Guest', GuestSchema);
module.exports = Guest;
