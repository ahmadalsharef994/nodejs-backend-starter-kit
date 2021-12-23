const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const thyroTokenSchema = mongoose.Schema(
  {
    thyroAccessToken: {
      type: String,
      required: true,
    },
    thyroApiKey: {
      type: String,
      required: true,
    },
    identifier: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
thyroTokenSchema.plugin(toJSON);

/**
 * @typedef Token
 */
const ThyroToken = mongoose.model('ThyroToken', thyroTokenSchema);

module.exports = ThyroToken;
