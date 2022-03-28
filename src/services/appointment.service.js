/* eslint-disable no-param-reassign */
const Agenda = require('agenda');
const httpStatus = require('http-status');
const short = require('short-uuid');
const ApiError = require('../utils/ApiError');
const {
  AppointmentSession,
  Followup,
  Prescription,
  Appointment,
  VerifiedDoctors,
  AppointmentPreference,
  Feedback,
  UserBasic,
  doctordetails,
} = require('../models');
const DyteService = require('../Microservices/dyteServices');
const pusherService = require('../Microservices/pusherService');
const tokenService = require('./token.service');
const appointmentPreferenceService = require('./appointmentpreference.service');
const config = require('../config/config');
const authService = require('./auth.service');

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
  const ChatExchangeToken = tokenService.generateChatAppointmentSessionToken(
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
  bookingType,
  issue,
  patientname,
  patientmobile,
  patientmail
) => {
  const users = await UserBasic.find({ auth: `${userAuth._id}` }, { auth: 1, dob: 1, gender: 1 });
  const appointmentDate = new Date(date).toDateString();
  if (bookingType === 'TODAY') {
    const currentdate = new Date().toDateString();
    const bookingdate = new Date(date).toDateString();
    if (currentdate !== bookingdate) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Your booking date is not todays date');
    }
  }
  let Gender = '';
  let age = 0;
  if (users) {
    Gender = users[0].gender;
    age = new Date().getFullYear() - users[0].dob.getFullYear();
  } else {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'IN ORDER TO COMPLETE YOUR APPOINTMENT BOOKING YOU NEED TO COMPLETE YOUR BASIC PROFILE FIRST !'
    );
  }
  let startTime = null;
  let endTime = null;
  let doctorauth = null;
  try {
    const { doctorauthid } = await VerifiedDoctors.findOne({ docid: doctorId });
    doctorauth = doctorauthid;
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Doctor not found');
  }
  const Doctordetails = await doctordetails.findOne({ doctorId });
  const doctorname = Doctordetails.name;
  const appointmentPrice = Doctordetails.appointmentPrice;

  await AppointmentPreference.findOne({ docid: doctorId }).then((pref) => {
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
    const requestedDay = slotId.split('-')[1];
    if (weekday[correctDay] !== requestedDay) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Requested weekday doesn't matches the given date");
    }
  });

  const appointmentExist = await Appointment.findOne({ docid: doctorId, StartTime: startTime }).exec();
  if (appointmentExist || startTime === null || endTime === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Appointment Already Booked');
  }
  const orderid = `MDZGX${Math.floor(Math.random() * 10)}${short.generate().toUpperCase()}`;

  try {
    const bookedAppointment = await Appointment.create({
      AuthDoctor: doctorauth,
      docid: doctorId,
      doctorName: doctorname,
      slotId,
      AuthUser: userAuth,
      Type: bookingType,
      Date: appointmentDate,
      StartTime: startTime,
      EndTime: endTime,
      Gender,
      age,
      HealthIssue: issue,
      price: appointmentPrice,
      patientName: patientname,
      patientMobile: patientmobile,
      patientMail: patientmail,
      orderId: orderid,
    });
    agenda.start();
    await ScheduleSessionJob(bookedAppointment.id, bookedAppointment.StartTime);
    return { id: bookedAppointment.id, orderId: bookedAppointment.orderId };
  } catch (error) {
    return false;
  }
};

const submitFollowupDetails = async (appointmentId, doctorId, slotId, date, documents, status) => {
  let startTime = null;
  let endTime = null;
  const AppointmentData = await Appointment.findById(appointmentId).exec();
  if (!AppointmentData) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot find Appointment to assign Followup');
  }
  await AppointmentPreference.findOne({ docid: doctorId }).then((pref) => {
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
    const requestedDay = slotId.split('-')[1];
    if (weekday[correctDay] !== requestedDay) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Requested weekday doesn't matches the given date");
    }
  });
  const previousFollwups = await Followup.find({ Appointment: AppointmentData.id }).exec();
  const followupExist = await Followup.findOne({ Appointment: AppointmentData.id, StartTime: startTime }).exec();
  if (followupExist || startTime === null || endTime === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Followup Already Booked');
  }
  const appointmentDate = new Date(date).toDateString();
  const assignedFollowup = await Followup.create({
    Appointment: AppointmentData,
    docid: doctorId,
    slotId,
    StartTime: startTime,
    EndTime: endTime,
    FollowupNo: previousFollwups.length + 1,
    FollowupDocs: documents,
    Status: status,
    Date: appointmentDate,
    Gender: AppointmentData.Gender,
  });
  return assignedFollowup;
};

const getUpcomingAppointments = async (doctorId, limit) => {
  const res = await Appointment.find({
    docid: doctorId,
    paymentStatus: 'PAID',
    Status: { $nin: 'cancelled' },
    StartTime: { $gte: new Date() },
  })
    .sort([['StartTime', 1]])
    .limit(parseInt(limit, 10));
  return res;
};

const getAppointmentsByType = async (doctorId, filter, options) => {
  if (filter.Type === 'ALL') {
    const result = await Appointment.paginate({ paymentStatus: 'PAID' }, filter, options);
    return result;
  }
  if (filter.Type === 'CANCELLED') {
    const res = await Appointment.paginate({ Status: 'cancelled', docid: doctorId }, filter, options);
    return res;
  }
  if (filter.Type === 'PAST') {
    const result = await Appointment.paginate(
      { StartTime: { $lt: new Date() }, paymentStatus: 'PAID', docid: doctorId, Status: { $nin: 'cancelled' } },
      filter,
      options
    );
    return result;
  }
  if (filter.Type === 'TODAY') {
    const result = await Appointment.paginate(
      { Date: new Date().toDateString(), paymentStatus: 'PAID', Status: { $nin: 'cancelled' } },
      filter,
      options
    );
    return result;
  }
  if (filter.Type === 'REFERRED') {
    const result = await Appointment.paginate(
      { Type: 'REFERRED', paymentStatus: 'PAID', Status: { $nin: 'cancelled' } },
      filter,
      options
    );
    return result;
  }
};

const getFollowupsById = async (limit) => {
  const count = parseInt(limit, 10);
  const result = await Followup.find()
    .sort([['StartTime', 1]])
    .limit(count);
  return result;
};

const getAvailableAppointmentSlots = async (doctorId, date) => {
  const getDayOfWeek = (requiredDate) => {
    const dayOfWeek = new Date(requiredDate).getDay();
    // eslint-disable-next-line no-restricted-globals
    return isNaN(dayOfWeek) ? null : ['SUN_A', 'MON_A', 'TUE_A', 'WED_A', 'THU_A', 'FRI_A', 'SAT_A'][dayOfWeek];
  };

  const AllAppointmentSlots = await appointmentPreferenceService.getappointments(doctorId);
  if (!AllAppointmentSlots) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not Found');
  }
  const appointmentDate = new Date(date).toDateString();
  const bookedAppointmentSlots = await Appointment.find({ docid: doctorId, paymentStatus: 'PAID', Date: appointmentDate });
  const bookedSlotIds = bookedAppointmentSlots.map((item) => item.slotId);
  const result = {};
  for (let i = 0; i < 7; i += 1) {
    result[`${weekday[i]}_A`] = AllAppointmentSlots[`${weekday[i]}_A`].filter(
      (item) => !bookedSlotIds.includes(item.slotId)
    );
  }
  const Day = getDayOfWeek(date);
  let allslots = [];
  // eslint-disable-next-line array-callback-return
  Object.keys(result).map((k) => {
    if (k === Day) {
      allslots = result[k];
    }
  });
  const res = allslots.filter(function (slots) {
    return !bookedSlotIds.includes(slots);
  });

  return res;
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

// eslint-disable-next-line no-unused-vars
const fetchPatientDetails = async (patientid, doctorid) => {
  // const PatientAppointments = await Appointment.find({ AuthUser: patientid, AuthDoctor: doctorid });
  const PatientBasicDetails = await UserBasic.findOne({ auth: patientid }, { auth: 0 });
  const PatientAuth = await authService.getAuthById(patientid);
  const PatientName = PatientAuth.fullname;
  const PatientContact = { mobile: PatientAuth.mobile, email: PatientAuth.email };
  // return [PatientName, PatientBasicDetails, PatientContact, PatientAppointments];
  return [PatientName, PatientBasicDetails, PatientContact];
};

const fetchAllPatientDetails = async (doctorid, page, limit, sortBy) => {
  const patientIds = await Appointment.aggregate([
    { $sort: { StartTime: parseInt(sortBy, 10) } },
    { $group: { _id: { AuthUser: '$AuthUser' } } },
    {
      $facet: {
        metadata: [{ $count: 'total' }, { $addFields: { page: parseInt(page, 10) } }],
        data: [{ $skip: (parseInt(page, 10) - 1) * parseInt(limit, 10) }, { $limit: parseInt(limit, 10) }], // add projection here wish you re-shape the docs
      },
    },
  ]);

  const allPatientsData = [];
  let singlePatientData = {};
  for (let k = 0; k < patientIds[0].data.length; k += 1) {
    // eslint-disable-next-line no-await-in-loop
    singlePatientData = await fetchPatientDetails(patientIds[0].data[k]._id.AuthUser, doctorid);
    allPatientsData.push({
      'No.': k,
      'Patient Name': singlePatientData[0],
      'Patient Basic Details': singlePatientData[1],
      'Patient Contact Details': singlePatientData[2],
    });
  }

  patientIds[0].metadata[0].totalPages = Math.ceil(patientIds[0].metadata[0].total / limit);
  patientIds[0].metadata[0].limit = parseInt(limit, 10);

  if (allPatientsData.length) {
    return [allPatientsData, patientIds[0].metadata[0]];
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

const cancelAppointment = async (appointmentId) => {
  const appointmentData = await Appointment.findById({ _id: appointmentId });
  if (appointmentData.Status !== 'cancelled') {
    const result = await Appointment.findOneAndUpdate({ _id: appointmentId }, { Status: 'cancelled' }, { new: true });
    return result;
  }
  return null;
};

const rescheduleAppointment = async (doctorId, appointmentId, slotId, date, startDateTime, endDateTime) => {
  // find appointment by id
  const appointmentData = await Appointment.findById({ _id: appointmentId, docid: doctorId });
  // initiate timestamps
  let startTime = null;
  let endTime = null;

  // if custom date and time provided
  if (appointmentData && startDateTime && endDateTime) {
    startTime = new Date(`${startDateTime}:00 GMT+0530`);
    endTime = new Date(`${endDateTime}:00 GMT+0530`);
    const currentTime = new Date();
    if (startTime.getTime() <= currentTime.getTime()) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Rescheduled dateTimes cannot be past time');
    } else if (endTime.getTime() < startTime.getTime()) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Rescheduled startTime cannot be greater than endTime');
    } else if ((endTime.getTime() - startTime.getTime()) / 1000 > 7200) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'DateTime differences cannot be greater than 2 hours');
    }
  } else if (appointmentData && slotId && date) {
    // if slotId and date provided
    await AppointmentPreference.findOne({ docid: doctorId }).then((pref) => {
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
      const requestedDay = slotId.split('-')[1];
      if (weekday[correctDay] !== requestedDay) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Requested weekday doesn't matches the given date");
      }
    });
  }
  // check for null timestamps
  if (startTime === null || endTime === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error in creating timestamps!');
  }

  const result = await Appointment.findOneAndUpdate(
    { _id: appointmentId },
    { StartTime: startTime, EndTime: endTime, Status: 'booked', isRescheduled: true, slotId },
    { new: true }
  );

  return result;
};
const getDoctorsByCategories = async (category) => {
  const Doctordetails = await doctordetails.find({ specializations: { $in: [category] } });
  const isVerified = async (doctorid) => {
    const doctor = await VerifiedDoctors.findOne({ docid: doctorid });
    if (doctor) {
      return true;
    }
    return false;
  };
  const doctors = Doctordetails.filter(async (doctor) => {
    isVerified(doctor.doctorId);
    if (isVerified) {
      return doctor;
    }
  });
  if (doctors) {
    return { doctorDetails: doctors };
  }
  throw new ApiError(httpStatus.NOT_FOUND, 'No doctors in this category');
};

const verifyAppointment = async (orderId, appointmentId) => {
  const BookingDetails = await Appointment.findOne({ orderId });
  if (appointmentId === `${BookingDetails._id}`) {
    return { status: 'success', Message: 'Order confirmed', bookingDetails: BookingDetails, appointmentId };
  }
  return { status: 'failed', Message: 'Order not confirmed !' };
};
module.exports = {
  initiateappointmentSession,
  JoinappointmentSessionbyDoctor,
  JoinappointmentSessionbyPatient,
  submitAppointmentDetails,
  submitFollowupDetails,
  getUpcomingAppointments,
  getAppointmentsByType,
  getAvailableAppointmentSlots,
  getFollowupsById,
  getAvailableFollowUpSlots,
  getappointmentDoctor,
  createPrescriptionDoc,
  fetchPrescriptionDoc,
  fetchPatientDetails,
  fetchAllPatientDetails,
  userFeedback,
  doctorFeedback,
  cancelAppointment,
  rescheduleAppointment,
  getDoctorsByCategories,
  verifyAppointment,
};
