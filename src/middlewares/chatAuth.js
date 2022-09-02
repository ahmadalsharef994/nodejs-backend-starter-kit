// const httpStatus = require('http-status');
// const jwt = require('jsonwebtoken');
// const config = require('../config/config');

// const chatAuth = () => async (req, res, next) => {
//   try {
//     const header = req.headers.authorization;
//     const bearer = header.split(' ');
//     const token = bearer[1];
//     const secret = config.jwt.secret;
//     const payload = jwt.verify(token, secret);
//     const appointmentID = payload.appointment;
//     const doctorAuth = payload.doctor;
//     const userAuth = payload.user;
//     const entity = payload.entity;

//     if (appointmentID === undefined || doctorAuth === undefined || userAuth === undefined) {
//       res.status(httpStatus.BAD_REQUEST).json({ message: 'False Chat Information' });
//     } else {
//       req.user = userAuth;
//       req.doctor = doctorAuth;
//       req.appointment = appointmentID;
//       req.entity = entity;
//       next();
//     }
//   } catch (error) {
//     res.status(httpStatus.BAD_REQUEST).json({ message: 'Chat Authentication Failed' });
//   }
// };

// module.exports = chatAuth;
