const tokenService = require('./token.service');
const DyteService = require('../Microservices/dyteServices');
const VerifiedDoctors = require('../models/verifieddoctor');
const Appointment = require('../models/appointment.model');

const initiateappointmentSession = async (appointmentID, AuthData) => {
  // Pusher
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

const submitAppointmentDetails = async (docId, userAuth, status, type, startTime, endTime) => {
  const { doctorauthid } = await VerifiedDoctors.findOne({ docid: docId });
  const bookedAppointment = await Appointment.create({
    AuthDoctor: doctorauthid,
    docid: docId,
    AuthUser: userAuth,
    Status: status,
    Type: type,
    StartTime: startTime,
    EndTime: endTime,
    UserDocument: ['some document'],
    UserDescription: 'some prescription',
    HealthIssue: 'some issue',
    DoctorAction: 'Accepted',
    DoctorReason: 'none',
    UserAction: 'Requested Booking',
    UserReason: 'none',
    isRescheduled: false,
    DoctorRescheduleding: null,
  });
  return bookedAppointment;
};

module.exports = {
  initiateappointmentSession,
  JoinappointmentSessionbyDoctor,
  submitAppointmentDetails,
};
