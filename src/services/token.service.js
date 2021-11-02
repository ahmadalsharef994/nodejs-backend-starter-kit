const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const config = require('../config/config');
const { Token } = require('../models');
const { Devices } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Save a token
 * @param {string} token
 */
const saveToken = async (token) => {
  const tokenDoc = await Token.create({
    token,
  });
  return tokenDoc;
};

/**
 * Add A Device Login
 * @param {string} session
 * @param {string} authtoken
 * @param {string} ipaddress
 * @param {string} devicehash
 * @param {string} useragent
 * @param {string} fcmtoken
 */
const addDeviceHandler = async (session, authtoken, ipaddress, devicehash, devicetype, fcmtoken) => {
  const devicecheck = await Devices.findOne({ devicehash });
  if (devicecheck) {
    const authtokenhere = authtoken;
    const oldtoken = devicecheck.authtoken;
    await Devices.updateOne({ _id: devicecheck._id }, { $set: { authtoken: authtokenhere, loggedstatus: true } });
    await saveToken(oldtoken);
  } else {
    const deviceDoc = await Devices.create({
      session,
      authtoken,
      ipaddress,
      devicehash,
      devicetype,
      fcmtoken,
    });
    return deviceDoc;
  }
};

/**
 * Remove a Device/Logout
 * @param {string} authtoken
 * @returns {Promise}
 */
const logoutdevice = async (authtoken) => {
  const LoggedSessionDoc = await Devices.findOne({ authtoken });
  if (!LoggedSessionDoc) {
    throw new ApiError(httpStatus.BAD_GATEWAY, 'Something went wrong we are Monitoring');
  }
  await Devices.updateOne({ _id: LoggedSessionDoc._id }, { $set: { loggedstatus: false } });
};

/**
 * Generate Appointment Session token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateAppointmentSessionToken = (appointmentID, doctorId, secret = config.jwt.secret) => {
  const payload = {
    appointment: appointmentID,
    doctor: doctorId,
    iat: moment().unix(),
    exp: moment().add(20, 'minutes').unix(),
  };
  const jwttoken = jwt.sign(payload, secret);
  return jwttoken;
};

/**
 * Generate Admin token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateAdminToken = (userId, expires, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    role: 'admin',
    exp: moment().add(1, 'days').unix(),
  };
  const jwttoken = jwt.sign(payload, secret);
  return jwttoken;
};

/**
 * Generate Doctor token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateDoctorToken = (userId, expires, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    role: 'doctor',
    exp: moment().add(45, 'days').unix(),
  };
  const jwttoken = jwt.sign(payload, secret);
  return jwttoken;
};

/**
 * Generate Verified Doctor token
 * @param {ObjectId} userId
 * @param {string} docId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateVerifiedDoctorToken = (userId, docId, expires, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    role: 'doctor',
    docid: docId,
    exp: moment().add(45, 'days').unix(),
  };
  const jwttoken = jwt.sign(payload, secret);
  return jwttoken;
};

/**
 * Generate User token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateUserToken = (userId, expires, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    role: 'user',
    exp: moment().add(5, 'days').unix(),
  };
  const jwttoken = jwt.sign(payload, secret);
  return jwttoken;
};

module.exports = {
  generateAdminToken,
  generateDoctorToken,
  generateVerifiedDoctorToken,
  generateAppointmentSessionToken,
  generateUserToken,
  addDeviceHandler,
  logoutdevice,
  saveToken,
};
