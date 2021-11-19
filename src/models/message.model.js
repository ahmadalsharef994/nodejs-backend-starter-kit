const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const MessageSchema = mongoose.Schema(
  {
    appointment: {
      type: String, // ref
      required: true,
    },
    sender: {
      type: String, // ref
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    attachment: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
MessageSchema.plugin(toJSON);

/**
 * @typedef Message
 */

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;
