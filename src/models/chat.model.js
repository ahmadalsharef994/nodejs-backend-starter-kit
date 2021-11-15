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
      },
    ],
    messagesRef: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
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
