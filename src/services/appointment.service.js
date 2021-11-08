const DyteService = require('../Microservices/dyteServices');
const ApiError = require('../utils/ApiError');
const { AppointmentSession, Followup, Prescription, Appointment, VerifiedDoctors } = require('../models');

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

const submitAppointmentDetails = async (doctorId, userAuth, startTime, endTime) => {
  const { doctorauthid } = await VerifiedDoctors.findOne({ docid: doctorId });
  const bookedAppointment = await Appointment.create({
    AuthDoctor: doctorauthid,
    docid: doctorId,
    AuthUser: userAuth,
    Status: 'SCHEDULED',
    Type: 'PREBOOKED',
    StartTime: startTime,
    EndTime: endTime,
    UserDocument: ['some document'],
    UserDescription: 'some description',
    HealthIssue: 'some issue',
    DoctorAction: 'Pending',
    DoctorReason: 'none',
    UserAction: 'Requested Booking',
    UserReason: 'none',
    isRescheduled: false,
    DoctorRescheduleding: null,
  });
  return bookedAppointment;
};

const submitFollowupDetails = async (appointmentId, startTime, endTime) => {
  const AppointmentData = await Appointment.findById(appointmentId);
  const assignedFollowup = await Followup.create({
    Appointment: AppointmentData,
    StartTime: startTime,
    EndTime: endTime,
    FollowupNo: '1',
    FollowupDocs: ['some document'],
    Status: 'SCHEDULED',
  });
  return assignedFollowup;
};

const getUpcomingAppointments = async (doctorId) => {
  const promise = await Appointment.find(
    { docid: doctorId, Status: 'SCHEDULED' },
    { AuthUser: 1, StartTime: 1, EndTime: 1, Type: 1, Status: 1 }
  ).limit(1); // sort using StartTIme and limit
  return promise;
};

// get all appointments (implement query)
const getAllAppointments = async (doctorId, status) => {
  if (!status) {
    const promise = await Appointment.find({ docid: doctorId }).sort();
    // sort using StartTIme
    return promise;
  }
  const promise = await Appointment.find({ docid: doctorId, Status: status }).sort();
  // sort using StartTIme
  return promise;
};

const getFollowups = async (appointmentId) => {
  const promise = await Followup.find({ Appointment: appointmentId, Status: 'SCHEDULED' }).sort('-date');
  // sort using StartTIme
  return promise;
};

const getappointmentDoctor = async (appointmentID) => {
  const DoctorAppointmentExist = await Appointment.findOne({ _id: appointmentID });
  if (DoctorAppointmentExist) {
    return DoctorAppointmentExist;
  }
  return false;
};

const fetchPrescriptionDoc = async (prescriptionid) => {
  const DoctorPrescriptionDocument = await Prescription.findOne({ _id: prescriptionid });
  if (DoctorPrescriptionDocument) {
    return DoctorPrescriptionDocument;
  }
  return false;
};

const createPrescriptionDoc = async (prescriptionDoc, appointmentID) => {
  const alreadyExist = await fetchPrescriptionDoc(appointmentID);
  if (!alreadyExist) {
    // eslint-disable-next-line no-param-reassign
    prescriptionDoc.Appointment = appointmentID;
    const DoctorPrescriptionDocument = await Prescription.create(prescriptionDoc);
    return DoctorPrescriptionDocument;
  }
  return false;
};

module.exports = {
  initiateappointmentSession,
  JoinappointmentSessionbyDoctor,
  JoinappointmentSessionbyPatient,
  submitAppointmentDetails,
  submitFollowupDetails,
  getUpcomingAppointments,
  getAllAppointments,
  getFollowups,
  getappointmentDoctor,
  createPrescriptionDoc,
  fetchPrescriptionDoc,
};
