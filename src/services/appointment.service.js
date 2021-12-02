/* eslint-disable no-param-reassign */
const Agenda = require('agenda');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const {
  AppointmentSession,
  Followup,
  Prescription,
  Appointment,
  VerifiedDoctors,
  AppointmentPreference,
  Feedback,
} = require('../models');
const DyteService = require('../Microservices/dyteServices');
const pusherService = require('../Microservices/pusherService');
const tokenService = require('./token.service');
const appointmentPreferenceService = require('./appointmentpreference.service');
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
  // Dyte Service
  const DyteSessionToken = await DyteService.createDyteMeeting(
    appointmentID,
    AppointmentData.AuthDoctor,
    AppointmentData.AuthUser
  );
  if (!DyteSessionToken) {
    throw new ApiError(400, 'Error Generating Video Session');
  }
  return DyteSessionToken;
};

const JoinappointmentSessionbyDoctor = async (appointmentID, AuthData, socketID) => {
  // Join Appointment Doctor called while Doctor requests to Join an Appointment
  const AppointmentSessionData = await AppointmentSession.findOne({
    appointmentid: appointmentID,
    AuthDoctor: AuthData._id,
  });
  if (!AppointmentSessionData) {
    throw new ApiError(400, 'You do not have access to this Appointment');
  }
  let DoctorChatAuthToken = '';
  await pusherService
    .PusherSession(`private-${appointmentID}`, socketID)
    .then((result) => {
      DoctorChatAuthToken = result.auth;
    })
    .catch(() => {
      throw new ApiError(400, 'SocketID Error: Unable to Initiate Chat Token');
    });
  const DoctorVideoToken = AppointmentSessionData.dytedoctortoken;
  const DoctorRoomName = AppointmentSessionData.dyteroomname;
  const ChatExchangeToken = tokenService.generateChatAppointmentSessionToken(
    AppointmentSessionData.appointmentid,
    AppointmentSessionData.AuthDoctor,
    AppointmentSessionData.AuthUser,
    'doctor'
  );
  return { DoctorVideoToken, DoctorRoomName, DoctorChatAuthToken, ChatExchangeToken };
};

const JoinappointmentSessionbyPatient = async (appointmentID, AuthData, socketID) => {
  // Join Appointment User called while Doctor requests to Join an Appointment
  const AppointmentSessionData = await AppointmentSession.findOne({ appointmentid: appointmentID, AuthUser: AuthData._id });
  if (!AppointmentSessionData) {
    throw new ApiError(400, 'You do not have access to this Appointment');
  }
  const UserVideoToken = AppointmentSessionData.dyteusertoken;
  const UserRoomName = AppointmentSessionData.dyteroomname;
  let UserChatAuthToken = '';
  await pusherService
    .PusherSession(`private-${appointmentID}`, socketID)
    .then((result) => {
      UserChatAuthToken = result.auth;
    })
    .catch(() => {
      throw new ApiError(400, 'SocketID Error: Unable to Initiate Chat Token');
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
  const datetime = startTime.getTime() - 300000; // Scheduling Job 5mins before Appointment
  agenda.define('createSessions', async (job) => {
    const { appointment } = job.attrs.data;
    await initiateappointmentSession(appointment);
  });
  await agenda.schedule(datetime, 'createSessions', { appointment: appointmentID }); // Scheduling a Job in Agenda
};

const weekday = new Array(7);
weekday[0] = 'SUN';
weekday[1] = 'MON';
weekday[2] = 'TUE';
weekday[3] = 'WED';
weekday[4] = 'THU';
weekday[5] = 'FRI';
weekday[6] = 'SAT';

const submitAppointmentDetails = async (
  doctorId,
  userAuth,
  slotId,
  date,
  status,
  bookingType,
  documents,
  description,
  issue,
  doctorAction,
  doctorReason,
  userAction,
  userReason,
  rescheduled,
  doctorRescheduleding,
  labTest
) => {
  let startTime = null;
  let endTime = null;
  let doctorauth = null;
  try {
    const { doctorauthid } = await VerifiedDoctors.findOne({ docid: doctorId });
    doctorauth = doctorauthid;
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Doctor not found');
  }

  await AppointmentPreference.findOne({ docid: doctorId })
    .then((pref) => {
      const day = slotId.split('-')[1];
      const type = slotId.split('-')[0];
      const slots = pref[`${day}_${type}`];
      const slot = slots.filter((e) => e.slotId === slotId);
      if (slot.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Slot not found');
      }
      startTime = new Date(`${date} ${slot[0].FromHour}:${slot[0].FromMinutes}:00 GMT+0530`);
      endTime = new Date(`${date} ${slot[0].ToHour}:${slot[0].ToMinutes}:00 GMT+0530`);
      const currentTime = new Date();
      if (startTime.getTime() <= currentTime.getTime()) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Appointments can be booked only for future dates');
      }
      const correctDay = startTime.getDay();
      const requestedDay = slotId.split('-')[0];
      if (weekday[correctDay] !== requestedDay) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Requested weekday doesn't matches the given date");
      }
    })
    .catch(() => {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Something went wrong with Appointment creation process');
    });

  const appointmentExist = await Appointment.findOne({ docid: doctorId, StartTime: startTime }).exec();
  if (appointmentExist || startTime === null || endTime === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Appointment Already Booked');
  }

  const bookedAppointment = await Appointment.create({
    AuthDoctor: doctorauth,
    docid: doctorId,
    AuthUser: userAuth,
    Status: status,
    Type: bookingType,
    StartTime: startTime,
    EndTime: endTime,
    UserDocument: documents,
    UserDescription: description,
    HealthIssue: issue,
    DoctorAction: doctorAction,
    DoctorReason: doctorReason,
    UserAction: userAction,
    UserReason: userReason,
    isRescheduled: rescheduled,
    DoctorRescheduleding: doctorRescheduleding,
    LabTest: labTest,
  });
  agenda.start();
  await ScheduleSessionJob(bookedAppointment.id, bookedAppointment.StartTime);
  return bookedAppointment;
};

const submitFollowupDetails = async (appointmentId, doctorId, slotId, date, documents, status) => {
  let startTime = null;
  let endTime = null;
  const AppointmentData = await Appointment.findById(appointmentId).exec();
  if (!AppointmentData) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot find Appointment to assign Followup');
  }
  await AppointmentPreference.findOne({ docid: doctorId })
    .then((pref) => {
      const day = slotId.split('-')[1];
      const type = slotId.split('-')[0];
      const slots = pref[`${day}_${type}`];
      const slot = slots.filter((e) => e.slotId === slotId);
      if (slot.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Slot not found');
      }
      startTime = new Date(`${date} ${slot[0].FromHour}:${slot[0].FromMinutes}:00 GMT+0530`);
      endTime = new Date(`${date} ${slot[0].ToHour}:${slot[0].ToMinutes}:00 GMT+0530`);
      const currentTime = new Date();
      if (startTime.getTime() <= currentTime.getTime()) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Followups can be booked only for future dates');
      }
      const correctDay = startTime.getDay();
      const requestedDay = slotId.split('-')[0];
      if (weekday[correctDay] !== requestedDay) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Requested weekday doesn't matches the given date");
      }
    })
    .catch(() => {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Something went wrong with Followup creation process');
    });
  const previousFollwups = await Followup.find({ Appointment: AppointmentData.id }).exec();
  const followupExist = await Followup.findOne({ Appointment: AppointmentData.id, StartTime: startTime }).exec();
  if (followupExist || startTime === null || endTime === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Followup Already Booked');
  }
  const assignedFollowup = await Followup.create({
    Appointment: AppointmentData,
    StartTime: startTime,
    EndTime: endTime,
    FollowupNo: previousFollwups.length + 1,
    FollowupDocs: documents,
    Status: status,
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

const getAvailableFollowUpSlots = async (doctorId) => {
  const AllFollwUpSlots = await appointmentPreferenceService.getfollowups(doctorId);
  const assignedFollowUpSlots = await Followup.find({ docid: doctorId, Status: 'ASSIGNED' });
  const assignedSlotIds = assignedFollowUpSlots.map((item) => item.slotId);
  const result = {};
  for (let i = 0; i < 7; i += 1) {
    result[`${weekday[i]}_F`] = AllFollwUpSlots[`${weekday[i]}_F`].filter((item) => !assignedSlotIds.includes(item.slotId));
  }
  return result;
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

const doctorFeedback = async (feedbackDoc, appointmentId) => {
  const feedbackData = await Feedback.findOne({ appointmentId });
  if (feedbackData) {
    await Feedback.findOneAndUpdate(
      { appointmentId },
      { $set: { userRating: feedbackDoc.userRating, userDescription: feedbackDoc.userDescription } },
      { useFindAndModify: false }
    );
    return { message: 'feedback added sucessfully' };
  }
  feedbackDoc.appointmentId = appointmentId;
  const DoctorNotifications = await Feedback.create(feedbackDoc);
  if (DoctorNotifications) {
    return { message: 'feedback added sucessfully', feedbackDoc };
  }
  return false;
};

const userFeedback = async (feedbackDoc, appointmentId) => {
  const feedbackData = await Feedback.findOne({ appointmentId });
  if (feedbackData) {
    await Feedback.findOneAndUpdate(
      { appointmentId },
      { $set: { doctorRating: feedbackDoc.doctorRating, doctorDescription: feedbackDoc.doctorDescription } },
      { useFindAndModify: false }
    );
    return { message: 'feedback added sucessfully' };
  }
  feedbackDoc.appointmentId = appointmentId;
  const DoctorNotifications = await Feedback.create(feedbackDoc);
  if (DoctorNotifications) {
    return { message: 'feedback added sucessfully', feedbackDoc };
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
  getAvailableFollowUpSlots,
  getappointmentDoctor,
  createPrescriptionDoc,
  fetchPrescriptionDoc,
  fetchPatientDetails,
  fetchAllPatientDetails,
  userFeedback,
  doctorFeedback,
};
