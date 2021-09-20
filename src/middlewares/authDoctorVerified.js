const jwt = require('jsonwebtoken');
const { Strategy: ExtractJwt } = require('passport-jwt');
const config = require('../config/config');
const checkBanned = require('../utils/CheckBanned');
const SessionCheck = require('../utils/SessionCheck');

const authdoctorverified = () => async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const bearer = header.split(' ');
    const token = bearer[1];
    const secret = config.jwt.secret;
    const payload = jwt.verify(token, secret);
    const subid = payload.sub;
    const docid = payload.docid;
    const subidrole = payload.role;
    req.SubjectId = subid;
    req.Docid = docid;
    const bancheck = await checkBanned(subid);
    const sessionbancheck = await SessionCheck(token);
    if (bancheck.isbanned == true) {
      res.status(401).json('You are Banned please reach support');
    } else if (!bancheck.role.includes('doctor') || subidrole != 'doctor') {
      res.status(401).json('You dont have Access to these resources');
    } else if (docid == 'null' || docid == undefined) {
      res.status(401).json('Your Verification is Awaited');
    } else if (sessionbancheck == true) {
      res.status(401).json('Session Expired Login Again');
    } else {
      next();
    }
  } catch (error) {
    res.status(400).json('Invalid Request!');
  }
};

module.exports = authdoctorverified;
