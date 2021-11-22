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
    languages: {
      type: Array,
      require: true,
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
