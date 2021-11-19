const Agenda = require('agenda');
const ApiError = require('../utils/ApiError');
const {
  AppointmentSession,
  Followup,
  Prescription,
  Appointment,
  VerifiedDoctors,
  AppointmentPreference,
  ConsultationFee,
  Notification,
} = require('../models');
const DyteService = require('../Microservices/dyteServices');
const pusherService = require('../Microservices/pusherService');
const tokenService = require('./token.service');
const config = require('../config/config');

const dbURL = config.mongoose.url;
const agenda = new Agenda({
  db: { address: dbURL, collection: 'jobs' },
  processEvery: '20 seconds',
  useUnifiedTopology: true,
});

const initiateappointmentSession = async (appointmentID) => {
  const AppointmentData = await Appointment.findById({ _id: appointmentID });
  if (!AppointmentData) {
    throw new ApiError(400, 'Cannot Initiate Appointment Session');
  }
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

const JoinappointmentSessionbyDoctor = async (appointmentID, AuthData, socketID) => {
  // Join Appointment Doctor
  const AppointmentSessionData = await AppointmentSession.findOne({
    appointmentid: appointmentID,
    AuthDoctor: AuthData._id,
  });
  if (!AppointmentSessionData) {
    throw new ApiError(400, 'You do not have access to this Appointment');
  }
  const DoctorVideoToken = AppointmentSessionData.dytedoctortoken;
  const DoctorRoomName = AppointmentSessionData.dyteroomname;
  const DoctorChatAuthToken = pusherService.PusherSession(`private-${appointmentID}`, socketID);
  const ChatExchangeToken = tokenService.generateChatAppointmentSessionToken(
    AppointmentSessionData.appointmentid,
    AppointmentSessionData.AuthDoctor,
    AppointmentSessionData.AuthUser,
    'doctor'
  );
  return { DoctorVideoToken, DoctorRoomName, DoctorChatAuthToken, ChatExchangeToken };
};

const JoinappointmentSessionbyPatient = async (appointmentID, AuthData, socketID) => {
  // Join Appointment Doctor
  const AppointmentSessionData = await AppointmentSession.findOne({ appointmentid: appointmentID, AuthUser: AuthData._id });
  if (!AppointmentSessionData) {
    throw new ApiError(400, 'You do not have access to this Appointment');
  }
  const UserVideoToken = AppointmentSessionData.dyteusertoken;
  const UserRoomName = AppointmentSessionData.dyteroomname;
  let UserChatAuthToken = '';
  await pusherService.PusherSession(`private-${appointmentID}`, socketID).then((result) => {
    UserChatAuthToken = result.auth;
  });
  const ChatExchangeToken = await tokenService.generateChatAppointmentSessionToken(
    AppointmentSessionData.appointmentid,
    AppointmentSessionData.AuthDoctor,
    AppointmentSessionData.AuthUser,
    'user'
  );
  return { UserVideoToken, UserRoomName, UserChatAuthToken, ChatExchangeToken };
};

const ScheduleSessionJob = async (appointmentID, startTime) => {
  const datetime = startTime.getTime() - 300000; // This comes appointment start time - 5 minutes, 300000 is Milisecond offset
  agenda.define('createSessions', async (job) => {
    const { appointment } = job.attrs.data;
    await initiateappointmentSession(appointment);
  });
  await agenda.schedule(datetime, 'createSessions', { appointment: appointmentID }); // Run the dummy job in 10 minutes and passing data.
};

const submitAppointmentDetails = async (doctorId, userAuth, slotId, date) => {
  let startTime = null;
  let endTime = null;
  const { doctorauthid } = await VerifiedDoctors.findOne({ docid: doctorId });
  await AppointmentPreference.findOne({ docid: doctorId }).then((pref) => {
    const day = slotId.split('-')[1];
    const type = slotId.split('-')[0];
    const slots = pref[`${day}_${type}`];
    const slot = slots.filter((e) => e.slotId === slotId);
    if (!slot.length) {
      return null;
    }
    startTime = new Date(`${date} ${slot[0].FromHour}:${slot[0].FromMinutes}:00 GMT+0530`);
    endTime = new Date(`${date} ${slot[0].ToHour}:${slot[0].ToMinutes}:00 GMT+0530`);
  });
  const appointmentExist = await Appointment.findOne({ docid: doctorId, StartTime: startTime }).exec();
  if (appointmentExist || startTime === null || endTime === null) {
    return null;
  }
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
  agenda.start();
  await ScheduleSessionJob(bookedAppointment.id, bookedAppointment.StartTime);
  return bookedAppointment;
};

const submitFollowupDetails = async (appointmentId, doctorId, slotId, date) => {
  let startTime = null;
  let endTime = null;
  const AppointmentData = await Appointment.findById(appointmentId).exec();
  if (!AppointmentData) {
    return null;
  }
  await AppointmentPreference.findOne({ docid: doctorId }).then((pref) => {
    const day = slotId.split('-')[1];
    const type = slotId.split('-')[0];
    const slots = pref[`${day}_${type}`];
    const slot = slots.filter((e) => e.slotId === slotId);
    if (!slot.length) {
      return null;
    }
    startTime = new Date(`${date} ${slot[0].FromHour}:${slot[0].FromMinutes}:00 GMT+0530`);
    endTime = new Date(`${date} ${slot[0].ToHour}:${slot[0].ToMinutes}:00 GMT+0530`);
  });
  const followupExist = await Followup.findOne({ Appointment: AppointmentData.id, StartTime: startTime }).exec();
  if (followupExist || startTime === null || endTime === null) {
    return null;
  }
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

const getAllAppointments = async (doctorId, type) => {
  if (!type) {
    const promise = await Appointment.find({ docid: doctorId }).sort();
    // sort using StartTIme
    return promise;
  }
  const promise = await Appointment.find({ docid: doctorId, Type: type }).sort();
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

const fetchPatientDetails = async (patientid, doctorid) => {
  const PatientidDocument = await Appointment.find({ AuthUser: patientid, AuthDoctor: doctorid });
  if (PatientidDocument) {
    return { PatientidDocument };
  }
  return false;
};

const fetchAllPatientDetails = async (doctorid) => {
  const DoctorPatientidDocument = await Appointment.find({ AuthDoctor: doctorid });
  if (DoctorPatientidDocument) {
    return DoctorPatientidDocument;
  }
  return false;
};

const addConsultationfee = async (consultationfeeDoc) => {
  const DoctorConsultationfee = await ConsultationFee.create(consultationfeeDoc);
  if (DoctorConsultationfee) {
    return { message: 'Consultation fee added Sucessfully', DoctorConsultationfee };
  }
  return false;
};

const notifications = async (notificationsDoc) => {
  const DoctorNotifications = await Notification.create(notificationsDoc);
  if (DoctorNotifications) {
    return { message: 'notification option added sucessfully', DoctorNotifications };
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
  fetchPatientDetails,
  fetchAllPatientDetails,
  addConsultationfee,
  notifications,
};
