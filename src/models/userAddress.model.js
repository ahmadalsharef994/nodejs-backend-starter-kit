const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');

const userAddressSchema = mongoose.Schema(
  {
    addressFristLine: {
      type: String,
      required: true,
    },
    addressSecondLine: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      default: null,
    },
    pincode: {
      type: Number,
      default: null,
    },
    auth: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Auth,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userAddressSchema.plugin(toJSON);

/**
 * @typedef UserAddress
 */
const UserAddress = mongoose.model('UserAddress', userAddressSchema);

module.exports = UserAddress;
