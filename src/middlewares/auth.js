const passport = require('passport');
const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');
const config = require('../config/config');
// const checkBanned = require('../utils/CheckBanned'); // TO DEPRECATE
// const SessionCheck = require('../utils/SessionCheck'); // TO DEPRECATE

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

const auth =
  (...requiredRights) =>
  async (req, res, next) => {
    return new Promise((resolve, reject) => {
      passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

const authAdmin = () => async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const bearer = header.split(' ');
    const token = bearer[1];
    const { secret } = config.jwt;
    const payload = jwt.verify(token, secret);
    const subid = payload.sub;
    const subidrole = payload.role;
    req.SubjectId = subid;
    // const bancheck = await checkBanned(subid);
    // console.log(bancheck)
    // const sessionbancheck = await SessionCheck(token);
    if (subidrole !== 'admin') {
      res.status(httpStatus.UNAUTHORIZED).json({ message: 'You dont have Access to these resources' });
    }
    next();
    // else if (sessionbancheck === true) {
    //   res.status(httpStatus.UNAUTHORIZED).json({ message: 'Session Expired Login Again' });
    // } else {
    //   next();
    // }
  } catch (error) {
    res.status(httpStatus.UNAUTHORIZED).json({ message: 'Forbidden Error' });
  }
};

const authUser = () => async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const bearer = header.split(' ');
    const token = bearer[1];
    const { secret } = config.jwt;
    const payload = jwt.verify(token, secret);
    const subid = payload.sub;
    const subidrole = payload.role;
    req.SubjectId = subid;
    // const bancheck = await checkBanned(subid);
    // console.log(bancheck)
    // const sessionbancheck = await SessionCheck(token);
    if (subidrole !== 'user' && subidrole !== 'admin' && subidrole !== 'doctor') {
      res.status(httpStatus.UNAUTHORIZED).json({ message: 'You dont have Access to these resources' });
    }
    next();
    // else if (sessionbancheck === true) {
    //   res.status(httpStatus.UNAUTHORIZED).json({ message: 'Session Expired Login Again' });
    // } else {
    //   next();
    // }
  } catch (error) {
    res.status(httpStatus.UNAUTHORIZED).json({ message: 'Forbidden Error' });
  }
};

module.exports = { auth, authUser, authAdmin };
