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
  bucket: process.env.BUCKET,
  signatureVersion: 'v4',
});

dotenv.config();

// const pusher = new Pusher({
//   appId: process.env.APP_ID,
//   key: process.env.APP_KEY,
//   secret: process.env.APP_SECRET,
//   cluster: process.env.APP_CLUSTER,
//   useTLS: process.env.USE_TLS,
// });

// implement pagination
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

const createMessage = async (data) => {
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
  if (data.attachments) {
    // eslint-disable-next-line no-param-reassign
    data.attachments = await data.attachments.map(async (attachment) => {
      const params = {
        Bucket: process.env.BUCKET,
        Key: `${appointmentId}-${uuid()}`,
        Body: attachment,
      };
      // eslint-disable-next-line no-shadow
      await AwsS3.upload(params);
      return AwsS3.getSignedUrl('getObject', {
        Bucket: process.env.BUCKET,
        Key: `${uuid()}`,
      });
    });
  }
  // const filename = 'src/Microservices/labtestdata.json';
  // const fileContent = fs.readFileSync(filename);
  // console.log(fileContent); // <Buffer 5b 0a 20 20 20 20 7b 0a 20 20 20 20 20 20 20 20 22 69 64 22 3a 20 31 2c 0a 20 20 20 20 20 20 20 20 22 4c 61 62 20 74 65 73 74 73 22 3a 20 22 48 49 61 ... 15994 more bytes>

  appointment.chatHistory.messages.push({
    messageId: uuid(), // unique id of msg
    body: data.body,
    contentType: 'text',
    attachments: data.attachments, // data.location
    createdAt: Date.now(),
    senderId: data.senderId,
  });
  // console.log(JSON.stringify(appointment));
  await Appointment.findByIdAndUpdate(appointmentId, appointment);
};

module.exports = {
  getMessages,
  createMessage,
};
