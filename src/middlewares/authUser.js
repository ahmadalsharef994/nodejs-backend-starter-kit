const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
// const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const checkBanned = require('../utils/CheckBanned');
const SessionCheck = require('../utils/SessionCheck');

const authuser = () => async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const bearer = header.split(' ');
    const token = bearer[1];
    const secret = config.jwt.secret;
    const payload = jwt.verify(token, secret);
    const subid = payload.sub;
    const subidrole = payload.role;
    req.SubjectId = subid;
    const bancheck = await checkBanned(subid);
    const sessionbancheck = await SessionCheck(token);
    if (bancheck.isbanned === true) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: 'You are Banned please reach support' });
    } else if (!bancheck.role.includes('user') || subidrole !== 'user') {
      res.status(httpStatus.UNAUTHORIZED).json({ message: 'You dont have Access to these resources' });
    } else if (sessionbancheck === true) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: 'Session Expired Login Again' });
    } else {
      next();
    }
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid Request!' });
  }
};

module.exports = authuser;
