// Updated token.service.js

const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const config = require('../config/config');
const { Token } = require('../models');
const { Devices } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Generate auth tokens based on role
 * @param {Object} user - The user object containing role and id
 * @returns {Object} tokens - JWT token and its expiration
 */
const generateAuthTokens = (user) => {
  let expires;
  let payload;
  const secret = config.jwt.secret;

  // Set token expiration and role-specific payload
  switch (user.role) {
    case 'admin':
      expires = moment().add(1, 'days');
      payload = {
        sub: user.id,
        role: 'admin',
        iat: moment().unix(),
        exp: expires.unix(),
      };
      break;
    case 'doctor':
      expires = moment().add(45, 'days');
      payload = {
        sub: user.id,
        role: 'doctor',
        iat: moment().unix(),
        exp: expires.unix(),
      };
      break;
    case 'user':
      expires = moment().add(5, 'days');
      payload = {
        sub: user.id,
        role: 'user',
        iat: moment().unix(),
        exp: expires.unix(),
      };
      break;
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user role');
  }

  // Sign and return JWT
  const token = jwt.sign(payload, secret);
  return { token, expires: expires.toDate() };
};

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
const addDeviceHandler = async (session, authtoken, ipaddress, devicehash, devicetype) => {
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
    throw new ApiError(httpStatus.BAD_GATEWAY, 'Something went wrong, we are monitoring');
  }
  await Devices.updateOne({ _id: LoggedSessionDoc._id }, { $set: { loggedstatus: false } });
};

module.exports = {
  generateAuthTokens,
  addDeviceHandler,
  logoutdevice,
  saveToken,
};
