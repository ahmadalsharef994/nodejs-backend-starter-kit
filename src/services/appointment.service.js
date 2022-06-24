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
const { emailService } = require('../Microservices');
const netEarn = require('../utils/netEarnCalculator');

const dbURL = config.mongoose.url;
const agenda = new Agenda({
  db: { address: dbURL, collection: 'jobs' },
  processEvery: '20 seconds',
  useUnifiedTopology: true,
});

const initiateAppointmentSession = async (appointmentId) => {
  const AppointmentData = await Appointment.findById({ _id: appointmentId });
  if (!AppointmentData) {
    throw new ApiError(400, 'Cannot Initiate Appointment Session');
  }
  // Dyte Service
  const DyteSessionToken = await DyteService.createDyteMeeting(
    appointmentId,
    AppointmentData.AuthDoctor,
    AppointmentData.AuthUser
  );
  if (!DyteSessionToken) {
    throw new ApiError(400, 'Error Generating Video Session');
  }
  return DyteSessionToken;
};

const joinAppointmentSessionbyDoctor = async (appointmentId, AuthData, socketID) => {
  // Join Appointment Doctor called while Doctor requests to Join an Appointment
  const AppointmentSessionData = await AppointmentSession.findOne({
    appointmentid: appointmentId,
    AuthDoctor: AuthData._id,
  });
  if (!AppointmentSessionData) {
    throw new ApiError(400, 'You do not have access to this Appointment');
  }
  let DoctorChatAuthToken = '';
  await pusherService
    .PusherSession(`private-${appointmentId}`, socketID)
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

const joinAppointmentSessionbyPatient = async (appointmentId, AuthData, socketID) => {
  // Join Appointment User called while Doctor requests to Join an Appointment
  const AppointmentSessionData = await AppointmentSession.findOne({ appointmentid: appointmentId, AuthUser: AuthData._id });
  if (!AppointmentSessionData) {
    throw new ApiError(400, 'You do not have access to this Appointment');
  }
  const UserVideoToken = AppointmentSessionData.dyteusertoken;
  const UserRoomName = AppointmentSessionData.dyteroomname;
  let UserChatAuthToken = '';
  await pusherService
    .PusherSession(`private-${appointmentId}`, socketID)
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

const ScheduleSessionJob = async (appointmentId, startTime) => {
  const datetime = startTime.getTime() - 300000; // Scheduling Job 5mins before Appointment
  agenda.define('createSessions', async (job) => {
    const { appointment } = job.attrs.data;
    await initiateAppointmentSession(appointment);
  });
  await agenda.schedule(datetime, 'createSessions', { appointment: appointmentId }); // Scheduling a Job in Agenda
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
  const doctorname = Doctordetails.doctorname;
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
    patientName: AppointmentData.patientName,
    docid: doctorId,
    slotId,
    StartTime: startTime,
    EndTime: endTime,
    FollowupNo: previousFollwups.length + 1,
    FollowupDocs: documents,
    Status: status,
    Date: appointmentDate,
    Gender: AppointmentData.Gender,
    HealthIssue: AppointmentData.HealthIssue,
    orderId: AppointmentData.orderId,
    AuthUser: AppointmentData.AuthUser,
  });
  return assignedFollowup;
};

const getUpcomingAppointments = async (doctorId, limit, options) => {
  const res = await Appointment.paginate(
    {
      docid: doctorId,
      paymentStatus: 'PAID',
      Status: { $nin: 'cancelled' },
      StartTime: { $gte: new Date() },
    },
    options
  );
  return res;
};

const getAppointmentsByType = async (doctorId, filter, options) => {
  if (filter.Type === 'FOLLOWUP') {
    const result = await Followup.paginate({ docid: doctorId, Status: { $nin: 'cancelled' } }, options);
    return result;
  }
  if (filter.Type === 'ALL') {
    const result = await Appointment.paginate({ paymentStatus: 'PAID' }, options);
    return result;
  }
  if (filter.Type === 'CANCELLED') {
    const res = await Appointment.paginate({ Status: 'cancelled', docid: doctorId }, options);
    return res;
  }
  if (filter.Type === 'PAST') {
    const result = await Appointment.paginate(
      { StartTime: { $lt: new Date() }, paymentStatus: 'PAID', docid: doctorId, Status: { $nin: 'cancelled' } },
      options
    );
    return result;
  }
  if (filter.Type === 'TODAY') {
    const result = await Appointment.paginate(
      { Date: new Date().toDateString(), paymentStatus: 'PAID', Status: { $nin: 'cancelled' } },
      options
    );
    return result;
  }
  if (filter.Type === 'REFERRED') {
    const result = await Appointment.paginate(
      { Type: 'REFERRED', paymentStatus: 'PAID', Status: { $nin: 'cancelled' } },
      options
    );
    return result;
  }
};

const allAppointments = async (doctorId, options) => {
  try {
    const followup = await Followup.paginate({ docid: doctorId, Status: { $nin: 'cancelled' } }, options);
    const cancelled = await Appointment.paginate({ Status: 'cancelled', docid: doctorId }, options);
    const past = await Appointment.paginate(
      {
        StartTime: { $lt: new Date() },
        paymentStatus: 'PAID',
        docid: doctorId,
        Status: { $nin: 'cancelled' },
      },
      options
    );
    const today = await Appointment.paginate(
      {
        Date: new Date().toDateString(),
        paymentStatus: 'PAID',
        Status: { $nin: 'cancelled' },
      },
      options
    );
    const referred = await Appointment.paginate(
      { Type: 'REFERRED', paymentStatus: 'PAID', Status: { $nin: 'cancelled' } },
      options
    );
    const upcoming = await Appointment.paginate(
      {
        docid: doctorId,
        paymentStatus: 'PAID',
        Status: { $nin: 'cancelled' },
        StartTime: { $gte: new Date() },
      },
      options
    );
    const data = { followup, today, cancelled, past, referred, upcoming };
    return data;
  } catch (error) {
    return error;
  }
};

const getFollowupsById = async (limit) => {
  const count = parseInt(limit, 10);
  const result = await Followup.find()
    .sort([['StartTime', 1]])
    .limit(count);
  return result;
};

const getAvailableAppointments = async (AuthData) => {
  const doctorId = AuthData._id;

  const AllAppointmentSlots = await appointmentPreferenceService.getAppointmentPreferences(doctorId);
  // console.log(AllAppointmentSlots)
  if (!AllAppointmentSlots) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Appointment Slots Found');
  }
  const bookedAppointmentSlots = await Appointment.find({ AuthDoctor: AuthData._id, paymentStatus: 'PAID' });

  if (bookedAppointmentSlots === []) {
    const availableAppointmentSlots = AllAppointmentSlots;
    return availableAppointmentSlots;
  }
  const bookedSlotIds = bookedAppointmentSlots.map((item) => item.slotId);

  const availableAppointmentSlots = {};
  for (let i = 0; i < 7; i += 1) {
    availableAppointmentSlots[`${weekday[i]}`] = AllAppointmentSlots[`${weekday[i]}`].filter(
      (item) => !bookedSlotIds.includes(item.slotId)
    );
  }
  // Object.keys(availableAppointmentSlots).forEach((day) => {
  //   if (['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].includes(day)) {
  //     availableAppointmentSlots[day] = availableAppointmentSlots[day].sort((a, b) => {
  //       if (a.FromHour === b.FromHour) {
  //         return a.FromMinutes - b.FromMinutes;
  //       }
  //       return a.FromHour - b.FromHour;
  //     });
  //   }
  // });
  return availableAppointmentSlots;
};

const getAvailableFollowUps = async (doctorId, date) => {
  const getDayOfWeek = (requiredDate) => {
    const dayOfWeek = new Date(requiredDate).getDay();
    // eslint-disable-next-line no-restricted-globals
    return isNaN(dayOfWeek) ? null : ['SUN_F', 'MON_F', 'TUE_F', 'WED_F', 'THU_F', 'FRI_F', 'SAT_F'][dayOfWeek];
  };

  const AllFollwUpSlots = await appointmentPreferenceService.getFollowups(doctorId);
  const assignedFollowUpSlots = await Followup.find({ docid: doctorId, Status: 'ASSIGNED' });
  const assignedSlotIds = assignedFollowUpSlots.map((item) => item.slotId);
  const result = {};
  for (let i = 0; i < 7; i += 1) {
    result[`${weekday[i]}_F`] = AllFollwUpSlots[`${weekday[i]}_F`].filter((item) => !assignedSlotIds.includes(item.slotId));
  }
  const Day = getDayOfWeek(date);
  let allslots = [];
  // eslint-disable-next-line array-callback-return
  Object.keys(result).map((k) => {
    if (k === Day) {
      allslots = result[k];
    }
  });
  return allslots;
};

const getAppointmentById = async (appointmentId) => {
  const DoctorAppointmentExist = await Appointment.findOne({ _id: appointmentId });
  if (DoctorAppointmentExist) {
    return DoctorAppointmentExist;
  }
  return false;
};

const getPrescription = async (prescriptionid) => {
  const DoctorPrescriptionDocument = await Prescription.findOne({ _id: prescriptionid });
  if (DoctorPrescriptionDocument) {
    return DoctorPrescriptionDocument;
  }
  return false;
};

const createPrescriptionDoc = async (prescriptionDoc, appointmentId, Authdata) => {
  prescriptionDoc.Appointment = appointmentId;
  prescriptionDoc.doctorAuth = Authdata;
  const DoctorPrescriptionDocument = await Prescription.create(prescriptionDoc);
  if (DoctorPrescriptionDocument) {
    return DoctorPrescriptionDocument;
  }
  return false;
};

// eslint-disable-next-line no-unused-vars
const getPatientDetails = async (patientid, doctorid) => {
  // const PatientAppointments = await Appointment.find({ AuthUser: patientid, AuthDoctor: doctorid });
  const PatientBasicDetails = await UserBasic.findOne({ auth: patientid }, { auth: 0 });
  const PatientAuth = await authService.getAuthById(patientid);
  const PatientName = PatientAuth.fullname;
  const PatientContact = { mobile: PatientAuth.mobile, email: PatientAuth.email };
  const currentdate = new Date();
  const appointments = await Appointment.find({
    AuthUser: patientid,
    StartTime: { $lt: `${currentdate}` },
    paymentStatus: 'PAID',
    AuthDoctor: doctorid,
  }).sort({
    StartTime: -1,
  });
  const RecentAppointment = appointments[0];
  const prescription = await Prescription.find({ Appointment: `${RecentAppointment.id}` }).sort({ createdAt: -1 });
  const LatestPrescription = prescription[0];
  return [PatientName, PatientBasicDetails, PatientContact, RecentAppointment, LatestPrescription];
};

const getTotalRevenue = async (doctorAuthId) => {
  const appointments = await Appointment.find({ AuthDoctor: doctorAuthId, paymentStatus: 'PAID', Type: 'PAST' });
  if (!appointments) return 0;
  const appoinmentPrices = appointments.map((appointment) => appointment.price);
  const totalRevenue = appoinmentPrices.reduce((sum, x) => sum + x);
  return totalRevenue;
};

const getTotalIncome = async (doctorAuthId) => {
  const appointments = await Appointment.find({ AuthDoctor: doctorAuthId, paymentStatus: 'PAID', Type: 'PAST' });
  if (!appointments) return 0;
  const appointmentIncomes = appointments.map((appointment) => netEarn(appointment.price));
  const totalIncome = appointmentIncomes.reduce((sum, x) => sum + x);
  return totalIncome;
};

const getPatientsCount = async (doctorAuthId) => {
  const appointments = await Appointment.find({ AuthDoctor: doctorAuthId });
  const patientIds = appointments.map((appointment) => appointment.AuthUser.toString());
  // convert objectId to String because objectIds aren't coparable (Set will consider duplicates as uniques)
  return new Set(patientIds).size;
};

const getPastPaidAppointments = async (doctorAuthId) => {
  const appointments = await Appointment.find({ AuthDoctor: doctorAuthId });
  const pastPaidAppointments = appointments.filter(
    (appointment) => appointment.paymentStatus === 'PAID' && appointment.Type === 'PAST'
  );
  pastPaidAppointments.sort((a, b) => new Date(b.StartTime) - new Date(a.StartTime)); // sort by date (descending)
  return pastPaidAppointments;
};

const getPatients = async (doctorid, page, limit, sortBy) => {
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
    singlePatientData = await getPatientDetails(patientIds[0].data[k]._id.AuthUser, doctorid);
    allPatientsData.push({
      'No.': k,
      'Patient Name': singlePatientData[0],
      'Patient Basic Details': singlePatientData[1],
      'Patient Contact Details': singlePatientData[2],
      'Patient Recent Appointment': singlePatientData[3],
      'Prescription ': singlePatientData[4],
    });
  }

  patientIds[0].metadata[0].totalPages = Math.ceil(patientIds[0].metadata[0].total / limit);
  patientIds[0].metadata[0].limit = parseInt(limit, 10);

  if (allPatientsData.length) {
    return [allPatientsData, patientIds[0].metadata[0]];
  }
  return false;
};

const getAppointmentFeedback = async (appointmentId) => {
  // const appointment = await Appointment.findById(appointmentId);
  // const AuthDoctor = appointment.AuthDoctor;
  // const AuthUser = appointment.AuthUser;
  // await Feedback.create({ appointmentId, AuthDoctor, AuthUser, doctorRating: 4.0, userRating: 4.0 });
  const feedbackData = await Feedback.findOne({ appointmentId });
  return feedbackData;
};

const getDoctorFeedbacks = async (doctorId) => {
  const feedbackData = await Feedback.find({ AuthDoctor: doctorId });
  return feedbackData;
};

const getDoctorFeedback = async (feedbackDoc, appointmentId) => {
  const feedbackData = await Feedback.findOne({ appointmentId });
  const AuthDoctor = await Appointment.findById(appointmentId).AuthDoctor;
  const AuthUser = await Appointment.findById(appointmentId).AuthUser;
  // // eslint-disable-next-line no-console
  // console.log(AuthDoctor, AuthUser);
  if (feedbackData) {
    await Feedback.findOneAndUpdate(
      { appointmentId },
      { $set: { AuthDoctor, AuthUser, userRating: feedbackDoc.userRating, userDescription: feedbackDoc.userDescription } },
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

const getUserFeedback = async (feedbackDoc, appointmentId) => {
  const feedbackData = await Feedback.findOne({ appointmentId });
  const AuthDoctor = await Appointment.findById(appointmentId).AuthDoctor;
  const AuthUser = await Appointment.findById(appointmentId).AuthUser;
  // eslint-disable-next-line no-console
  console.log(AuthDoctor, AuthUser);

  if (feedbackData) {
    await Feedback.findOneAndUpdate(
      { appointmentId },
      {
        $set: {
          AuthDoctor,
          AuthUser,
          doctorRating: feedbackDoc.doctorRating,
          doctorDescription: feedbackDoc.doctorDescription,
        },
      },
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

const rescheduleAppointment = async (doctorId, appointmentId, slotId, date, RescheduledReason, sendMailToUser) => {
  // find appointment by id
  let emailSent = true;
  let startTime = null;
  let endTime = null;
  const appointment = await Appointment.findById({ _id: appointmentId, docid: doctorId });
  if (!appointment) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Appointment doesn't exist");
  }
  const appointPreference = await AppointmentPreference.findOne({ docid: doctorId });
  const day = slotId.split('-')[0];
  const rescheduledDay = new Date(date).toDateString().toUpperCase().split(' ')[0];
  if (day !== rescheduledDay) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Requested weekday doesn't matches the given date");
  }
  const slots = appointPreference[`${day}`];
  const slot = slots.filter((e) => e.slotId === slotId);
  startTime = new Date(`${date} ${slot[0].FromHour}:${slot[0].FromMinutes}:00 GMT+0530`);
  endTime = new Date(`${date} ${slot[0].ToHour}:${slot[0].ToMinutes}:00 GMT+0530`);
  const currentTime = new Date();
  if (startTime.getTime() <= currentTime.getTime()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Appointments can be booked only for future dates');
  }
  if (startTime === null || endTime === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error in creating timestamps!');
  }
  const appointmentTime = new Date(date).getTime();
  const timeDifference = Math.round((appointmentTime - currentTime.getTime()) / (1000 * 3600 * 24));
  if (timeDifference >= 6) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'youre only allowed to reschedule your appointment within 6 days from current day'
    );
  }
  const appointmentDate = new Date(date).toDateString();
  const todayDate = new Date().toDateString();
  if (`${todayDate}` === `${appointmentDate}`) {
    const result = await Appointment.findOneAndUpdate(
      { _id: appointmentId },
      {
        StartTime: startTime,
        EndTime: endTime,
        Status: 'booked',
        Date: appointmentDate,
        Type: 'TODAY',
        isRescheduled: true,
        RescheduledReason,
        slotId,
      },
      { new: true }
    );
    if (appointment.patientMail && sendMailToUser === true) {
      const time = ` ${date} ${slot[0].FromHour}:${slot[0].FromMinutes} to ${slot[0].ToHour}:${slot[0].ToMinutes}`;
      await emailService.sendRescheduledEmail(appointment.patientMail, time, RescheduledReason, appointmentId);
    } else {
      emailSent = false;
    }
    return { result, emailSent };
  }
  const result = await Appointment.findOneAndUpdate(
    { _id: appointmentId },
    {
      StartTime: startTime,
      EndTime: endTime,
      Status: 'booked',
      Date: appointmentDate,
      isRescheduled: true,
      slotId,
      RescheduledReason,
    },
    { new: true }
  );
  if (appointment.patientMail && sendMailToUser === true) {
    const time = ` ${date} ${slot[0].FromHour}:${slot[0].FromMinutes} to ${slot[0].ToHour}:${slot[0].ToMinutes}`;
    await emailService.sendRescheduledEmail(appointment.patientMail, time, RescheduledReason, appointmentId);
  } else {
    emailSent = false;
  }
  return { result, emailSent };
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

const bookingConfirmation = async (orderId, appointmentId) => {
  const BookingDetails = await Appointment.findOne({ orderId });
  if (appointmentId === `${BookingDetails._id}`) {
    return { status: 'success', Message: 'Order confirmed', bookingDetails: BookingDetails, appointmentId };
  }
  return { status: 'failed', Message: 'Order not confirmed !' };
};

const cancelFollowup = async (followupid) => {
  const followup = await Followup.findById(followupid);
  if (followup.Status === 'cancelled') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `cant cancel followup ,id :${followup.id} because this id was already cancelled`
    );
  }
  await Followup.updateOne({ _id: followupid }, { $set: { Status: 'cancelled' } });
  const { Status } = await Followup.findById(followupid);
  if (Status === 'cancelled') {
    return true;
  }
  return false;
};

const rescheduleFollowup = async (followupid, slotId, date) => {
  let startTime = null;
  let endTime = null;
  const AppointmentData = await Followup.findById(followupid).exec();
  if (!AppointmentData) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot find Appointment to assign Followup');
  }
  const doctorId = AppointmentData.docid;
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
  const followupExist = await Followup.findOne({ Appointment: AppointmentData.id, StartTime: startTime }).exec();
  if (followupExist || startTime === null || endTime === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Followup Already Booked');
  }
  const newDate = new Date(date).toDateString();
  await Followup.updateOne(
    { _id: followupid },
    { $set: { slotId, StartTime: startTime, EndTime: endTime, Date: newDate, isRescheduled: true } }
  );
  const result = await Followup.findOne({ _id: followupid });
  if (result.slotId === slotId) {
    return result;
  }
  return false;
};
const deleteSlot = async (doctorAuthId, slotId) => {
  const slots = await AppointmentPreference.findOne({ doctorAuthId });
  const Weekdays = {
    MON: 'MON_A',
    TUE: 'TUE_A',
    WED: 'WED_A',
    THU: 'THU_A',
    FRI: 'FRI_A',
    SAT: 'SAT_A',
    SUN: 'SUN_A',
  };
  try {
    const day = `${slotId.split('-')[1]}`;
    const requiredDay = `${Weekdays[day]}`;
    if (!requiredDay) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Looks like this is not a valid slotId ,please enter a valid slotId');
    }
    const allSlots = slots[requiredDay];
    // eslint-disable-next-line array-callback-return
    const modifiedslot = allSlots.filter((slot) => {
      if (slot) {
        if (!slotId || slot.slotId !== slotId) {
          return slot;
        }
      }
    });
    await AppointmentPreference.findOneAndUpdate({ doctorAuthId }, { $set: { [requiredDay]: modifiedslot } });
    const slotsAfterDeletion = await AppointmentPreference.findOne({ doctorAuthId }, { [requiredDay]: 1 });
    return slotsAfterDeletion;
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Looks like this is not a valid slotId ,please enter a valid slotId');
  }
};
module.exports = {
  initiateAppointmentSession,
  joinAppointmentSessionbyDoctor,
  joinAppointmentSessionbyPatient,
  submitAppointmentDetails,
  submitFollowupDetails,
  getUpcomingAppointments,
  getAppointmentsByType,
  getAvailableAppointments,
  getFollowupsById,
  getAvailableFollowUps,
  getAppointmentById,
  createPrescriptionDoc,
  getPrescription,
  getPatientDetails,
  getPatients,
  getUserFeedback,
  getDoctorFeedback,
  cancelAppointment,
  rescheduleAppointment,
  getDoctorsByCategories,
  bookingConfirmation,
  cancelFollowup,
  rescheduleFollowup,
  allAppointments,
  deleteSlot,
  getPatientsCount,
  getTotalRevenue,
  getAppointmentFeedback,
  getDoctorFeedbacks,
  getPastPaidAppointments,
  getTotalIncome,
};
