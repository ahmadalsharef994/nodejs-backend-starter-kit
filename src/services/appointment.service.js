const tokenService = require('./token.service');
const DyteService = require('../Microservices/dyteServices');

const initiateappointmentSession = async (appointmentID, AuthData) => {
  // Dyte
  const DyteSessionToken = await DyteService.createDyteMeeting(appointmentID, 'doctorID', 'patientID');
  // Pusher
  return DyteSessionToken;
};

const JoinappointmentSessionbyDoctor = async (appointmentID, AuthData) => {
  // SessionToken
  const SessionToken = await tokenService.generateAppointmentSessionToken(appointmentID, AuthData._id);
  return { SessionToken };
};

module.exports = {
  initiateappointmentSession,
};
