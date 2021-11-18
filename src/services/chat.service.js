const Pusher = require('pusher');
const dotenv = require('dotenv');
const { Message } = require('../models');

dotenv.config();

const pusher = new Pusher({
  appId: process.env.APP_ID,
  key: process.env.APP_KEY,
  secret: process.env.APP_SECRET,
  cluster: process.env.APP_CLUSTER,
  useTLS: process.env.USE_TLS,
});

// implement pagination
const getChat = async (appointmentId) => {
  await Message.find({ appointment: appointmentId }).then((result) => {
    return result;
  });
};

const createMessage = async (appointmentId, senderAuth, text, attachment) => {
  await Message.create({
    appointment: appointmentId,
    sender: senderAuth,
    text,
    attachment,
  }).then((message) => {
    pusher.trigger(`private-${appointmentId}`, 'inserted', {
      id: message._id,
      text: message.text,
      username: message.username,
      attachment: message.attachment,
    });
    return message;
  });
};

module.exports = {
  getChat,
  createMessage,
};
