/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
const dotenv = require('dotenv');
const httpStatus = require('http-status');
const uuid = require('uuid');
const cloudinary = require('cloudinary').v2;

const { Appointment, DoctorBasic, UserBasic } = require('../models');
const ApiError = require('../utils/ApiError');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getMessages = async (appointmentId, authId) => {
  const appointment = await Appointment.findOne({ _id: appointmentId });
  if (!appointment) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Appointment ID does not give you access');
  }
  if (appointment.doctorAuthId.equals(authId) || appointment.userAuthId.equals(authId)) {
    const result = appointment.chatHistory;
    return result;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, "You don't have access to this Appointment Data");
};

const saveMessage = async (data) => {
  const appointmentId = data.appointmentId;
  const appointment = await Appointment.findOne({ _id: appointmentId });

  if (!appointment.chatHistory) {
    appointment.chatHistory = {};
    appointment.chatHistory.messages = [];
    appointment.chatHistory.appointmentId = appointmentId;
    const doctorBasic = await DoctorBasic.findOne({ auth: appointment.doctorAuthId });
    const doctorProfilePic = doctorBasic.avatar;
    const userBasic = await UserBasic.findOne({ auth: appointment.userAuthId });
    const userProfilePic = userBasic.avatar;
    appointment.chatHistory.particpants = [
      { name: appointment.doctorName, profilePic: doctorProfilePic },
      { name: appointment.patientName, profilePic: userProfilePic },
    ];
  }

  appointment.chatHistory.messages.push({
    messageId: uuid(),
    body: data.body,
    contentType: 'text',
    attachments: data.attachments,
    createdAt: Date.now(),
    senderId: data.senderId,
  });
  await Appointment.findByIdAndUpdate(appointmentId, appointment);
};

const uploadAttachment = async (attachments) => {
  const urls = [];

  for (const attachment of attachments) {
    const uploadResponse = await cloudinary.uploader.upload(attachment, {
      folder: 'attachments',
      use_filename: true,
      unique_filename: false,
      resource_type: 'auto',
      overwrite: false,
    });
    urls.push(uploadResponse.secure_url);
  }

  return urls;
};

module.exports = {
  getMessages,
  saveMessage,
  uploadAttachment,
};
