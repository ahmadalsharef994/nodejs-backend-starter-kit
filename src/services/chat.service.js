const Pusher = require('pusher');
const dotenv = require('dotenv');
const httpStatus = require('http-status');
const { Message, Appointment } = require('../models');
const ApiError = require('../utils/ApiError');

dotenv.config();

const pusher = new Pusher({
  appId: process.env.APP_ID,
  key: process.env.APP_KEY,
  secret: process.env.APP_SECRET,
  cluster: process.env.APP_CLUSTER,
  useTLS: process.env.USE_TLS,
});

// implement pagination
const getMessages = async (appointmentId, Auth, filter, options) => {
  const AppointmentData = await Appointment.findOne({ _id: appointmentId });
  if (!AppointmentData) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Appointment ID doesnot gives you Access');
  }
  if (AppointmentData.AuthDoctor.equals(Auth._id) || AppointmentData.AuthUser.equals(Auth._id)) {
    const result = await Message.paginate(filter, options);
    return result;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, "You don't have access to this Appointment Data");
};

const createMessage = async (appointmentId, senderAuth, text, attachment) => {
  await Message.create({
    appointment: appointmentId,
    sender: senderAuth,
    text,
    attachment,
  }).then((message, err) => {
    if (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'send message error');
    }
    pusher.trigger(`private-${message.appointment}`, 'inserted', {
      id: message._id,
      text: message.text,
      username: message.sender,
      attachment: message.attachment,
    });
  });
};

module.exports = {
  getMessages,
  createMessage,
};
