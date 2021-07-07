const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');

const auth = () => async (req, res, next) => {
  return new Promise((resolve) => {
    try {
      const header = req.headers.authorization;
      const bearer = header.split(' ');
      const token = bearer[1];
      const secret = config.jwt.secret;
      const payload = jwt.verify(token, secret);
      const subid = payload.sub;
      resolve();
      req.SubjectId = subid;
      return req;
    } catch (error) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid AuthHeader');
    }
  })
    .then(() => next())
    .catch((err) => next(err));
};
module.exports = auth;
