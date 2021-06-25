const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const config = require('../config/config');
const ApiError = require('./ApiError');

const getTokenSubID = async (token) => {
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    const subid = payload.sub;
    return subid;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'InCorrect AuthHeader');
  }
};
module.exports = getTokenSubID;
