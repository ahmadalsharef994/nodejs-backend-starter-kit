const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const config = require('../config/config');
const userService = require('./user.service');
const { Token } = require('../models');
const { Devices } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');

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
    await Devices.updateOne({ _id: devicecheck._id }, { $set: { authtoken: authtokenhere } });
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
 * Generate token
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
 * Generate token
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

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateDoctorToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateDoctorToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateDoctorToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user) => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateDoctorToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};

module.exports = {
  generateDoctorToken,
  generateUserToken,
  addDeviceHandler,
  logoutdevice,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
};