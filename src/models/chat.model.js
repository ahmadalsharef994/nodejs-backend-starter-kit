const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const ChatSchema = mongoose.Schema(
  {
    appointment: {
      type: String,
      required: true,
    },
    members: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
ChatSchema.plugin(toJSON);

/**
 * @typedef Chat
 */

const Chat = mongoose.model('Chat', ChatSchema);
module.exports = Chat;
