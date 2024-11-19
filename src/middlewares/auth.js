const passport = require('passport');
const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');

const verifyCallback = (req, resolve, reject) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;
  resolve();
};

const auth = () => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject))(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

const authUser = () => async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Authorization header is required');
    }
    const bearer = header.split(' ');
    const token = bearer[1];
    const { secret } = config.jwt;
    const payload = jwt.verify(token, secret);

    req.user = {
      id: payload.sub,
      role: payload.role,
    };
    next();
  } catch (error) {
    next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token'));
  }
};

module.exports = { auth, authUser };
