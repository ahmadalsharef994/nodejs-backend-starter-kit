const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');
const Wallet = require('./wallet.model');

const UserBasicSchema = mongoose.Schema(
  {
    gender: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    pincode: {
      type: Number,
      default: null,
    },
    languages: {
      type: Array,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    userid: {
      type: String,
      default: null,
    },
    maritalstatus: {
      type: String,
      default: null,
    },
    height: {
      type: String,
      default: null,
    },
    weight: {
      type: String,
      default: null,
    },
    auth: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Auth,
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Wallet,
    },
    address: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
UserBasicSchema.plugin(toJSON);

/**
 * @typedef UserBasic
 */
const UserBasic = mongoose.model('UserBasic', UserBasicSchema);

module.exports = UserBasic;
