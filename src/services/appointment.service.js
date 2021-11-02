const DyteService = require('../Microservices/dyteServices');
const VerifiedDoctors = require('../models/verifieddoctor');
const Appointment = require('../models/appointment.model');
const ApiError = require('../utils/ApiError');
const { AppointmentSession } = require('../models');

const initiateappointmentSession = async (appointmentID) => {
  const AppointmentData = await Appointment.findOne({ _id: appointmentID });
  // Dyte
  const DyteSessionToken = await DyteService.createDyteMeeting(
    appointmentID,
    AppointmentData.AuthDoctor,
    AppointmentData.AuthUser
  );
  if (!DyteSessionToken) {
    throw new ApiError(400, 'Error Generating Video Session');
  }
  // Pusher
  return DyteSessionToken;
};

const JoinappointmentSessionbyDoctor = async (appointmentID, AuthData) => {
  // Join Appointment Doctor
  const SessionToken = await AppointmentSession.findOne({ appointmentid: appointmentID, AuthDoctor: AuthData._id });
  if (!SessionToken) {
    throw new ApiError(400, 'You do not have access to this Appointment');
  }
  const DoctorVideoToken = SessionToken.dytedoctortoken;
  const DoctorRoomName = SessionToken.dyteroomname;
  return { DoctorVideoToken, DoctorRoomName };
};

const JoinappointmentSessionbyPatient = async (appointmentID, AuthData) => {
  // Join Appointment Doctor
  const SessionToken = await AppointmentSession.findOne({ appointmentid: appointmentID, AuthUser: AuthData._id });
  if (!SessionToken) {
    throw new ApiError(400, 'You do not have access to this Appointment');
  }
  const UserVideoToken = SessionToken.dyteusertoken;
  const UserRoomName = SessionToken.dyteroomname;
  return { UserVideoToken, UserRoomName };
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
  JoinappointmentSessionbyPatient,
  submitAppointmentDetails,
};
