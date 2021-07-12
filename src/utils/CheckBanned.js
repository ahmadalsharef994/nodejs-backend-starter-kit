const httpStatus = require('http-status');
const ApiError = require('./ApiError');
const { userService } = require('../services');

const checkBanned = async (subid) => {
  const AuthData = await userService.getUserById(subid);
  return AuthData;
};
module.exports = checkBanned;
