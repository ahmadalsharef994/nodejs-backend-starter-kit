const dotenv = require('dotenv');
const httpStatus = require('http-status');
const uuid = require('uuid');
const AWS = require('aws-sdk');
const { Appointment, DoctorBasic, UserBasic } = require('../models');
const ApiError = require('../utils/ApiError');

dotenv.config();

const AwsS3 = new AWS.S3({
  accessKeyId: process.env.AWSID,
  region: 'us-east-2',
  secretAccessKey: process.env.AWSKEY,
  bucket: process.env.PUBLICBUCKET,
  signatureVersion: 'v4',
});

// const pusher = new Pusher({
//   appId: process.env.APP_ID,
//   key: process.env.APP_KEY,
//   secret: process.env.APP_SECRET,
//   cluster: process.env.APP_CLUSTER,
//   useTLS: process.env.USE_TLS,
// });

const getMessages = async (appointmentId, Auth) => {
  const appointment = await Appointment.findOne({ _id: appointmentId });
  if (!appointment) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Appointment ID does not gives you Access');
  }
  if (appointment.AuthDoctor.equals(Auth._id) || appointment.AuthUser.equals(Auth._id)) {
    const result = appointment.chatHistory;
    return result;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, "You don't have access to this Appointment Data");
};

const saveMessage = async (data) => {
  // this part is asynchronous
  const appointmentId = data.appointmentId;
  const appointment = await Appointment.findOne({ _id: appointmentId });

  // if chatHistory null
  if (!appointment.chatHistory) {
    appointment.chatHistory = {};
    appointment.chatHistory.messages = [];
    appointment.chatHistory.appointmentId = appointmentId;
    const doctorBasic = await DoctorBasic.findOne({ auth: appointment.AuthDoctor });
    const doctorProfilePic = doctorBasic.avatar;
    const userBasic = await UserBasic.findOne({ auth: appointment.AuthUser });
    const userProfilePic = userBasic.avatar;
    appointment.chatHistory.particpants = [
      { name: appointment.doctorName, profilePic: doctorProfilePic },
      { name: appointment.patientName, profilePic: userProfilePic },
    ];
  }

  appointment.chatHistory.messages.push({
    messageId: uuid(), // unique id of msg
    body: data.body,
    contentType: 'text',
    attachments: data.attachments, // data.location
    createdAt: Date.now(),
    senderId: data.senderId,
  });
  await Appointment.findByIdAndUpdate(appointmentId, appointment);
};
// uploads attachment to S3 and returns corresponding URL
const uploadAttachment = (attachments) => {
  // eslint-disable-next-line no-param-reassign
  attachments = attachments.map((attachment) => {
    const attachmentKey = `${uuid()}`;
    // eslint-disable-next-line security/detect-new-buffer
    const base64data = attachment.toString('base64');

    const params = {
      Bucket: process.env.PUBLICBUCKET,
      Key: attachmentKey,
      Body: base64data,
      ContentEncoding: 'base64',
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    };
    // eslint-disable-next-line no-shadow
    AwsS3.upload(params, (err, data) => {
      if (err) throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to upload file to S3');
      return data;
    });

    const url = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
    return url;
  });
  return attachments;
};

module.exports = {
  getMessages,
  saveMessage,
  uploadAttachment,
};
