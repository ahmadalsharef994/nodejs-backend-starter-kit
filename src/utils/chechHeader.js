const httpStatus = require('http-status');
const ApiError = require('./ApiError');

const checkHeader = (req) => {
  try {
    const header = req.headers.authorization;
    const bearer = header.split(' ');
    const token = bearer[1];
    return token;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'AuthHeader Missing');
  }
};
module.exports = checkHeader;
