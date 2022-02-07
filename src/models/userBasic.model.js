const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');

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
UserBasicSchema.plugin(toJSON);

/**
 * @typedef UserBasic
 */
const UserBasic = mongoose.model('UserBasic', UserBasicSchema);

module.exports = UserBasic;
