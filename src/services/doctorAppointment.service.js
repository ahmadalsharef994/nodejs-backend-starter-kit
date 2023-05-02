/* eslint-disable no-param-reassign */
const Agenda = require('agenda');
const httpStatus = require('http-status');
const short = require('short-uuid');
const ApiError = require('../utils/ApiError');
const {
  // Followup,
  Prescription,
  Appointment,
  // VerifiedDoctors,
  AppointmentPreference,
  // Feedback,
  UserBasic,
  DoctorBasic,
  // doctordetails,
  // Auth,
} = require('../models');
const DyteService = require('../Microservices/dyteServices');
// const tokenService = require('./token.service');
const appointmentPreferenceService = require('./appointmentpreference.service');
const config = require('../config/config');
const authService = require('./auth.service');
const { emailService } = require('../Microservices');
const netEarn = require('../utils/netEarnCalculator');
// const User = require('../models/auth.model');
const documentService = require('./document.service');

const dbURL = config.mongoose.url;
const agenda = new Agenda({
  db: { address: dbURL, collection: 'jobs' },
  processEvery: '20 seconds',
  useUnifiedTopology: true,
});

const initiateAppointmentSession = async (appointmentId) => {
  const appointment = await Appointment.findOne({ _id: appointmentId });
  if (!appointment) {
    throw new ApiError(400, 'Cannot Initiate Appointment Session');
  }
  // Dyte Service
  const dyteSession = await DyteService.createDyteMeeting(appointmentId, appointment.doctorAuthId, appointment.userAuthId);
  if (!dyteSession) {
    throw new ApiError(400, 'Error Generating Video Session');
  }
  return dyteSession;
};

// const joinAppointmentDoctor = async (appointmentId) => {
//   // get participants data and store in Appointment
//   const appointment = await Appointment.findOne({ _id: appointmentId });
//   if (!appointment) {
//     throw new ApiError(400, 'Cannot Initiate Appointment Session');
//   }
//   // Dyte Service
//   const dyteSession = await DyteService.createDyteMeeting(appointmentId, appointment.doctorAuthId, appointment.userAuthId);
//   if (!dyteSession) {
//     throw new ApiError(400, 'Error Generating Video Session, Maybe, You do not have access to this Appointment');
//   }
//   try {
//     await DyteService.addDoctorParticipantToMeeting(dyteSession.dytemeetingid, appointment.doctorAuthId);
//   } catch (error) {
//     throw new ApiError(400, 'Error Adding Doctor Participant Video Session');
//   }

//   const videoToken = dyteSession.authToken;
//   const roomName = dyteSession.dyteroomname;
//   const chatExchangeToken = tokenService.generateChatAppointmentSessionToken(
//     dyteSession.appointmentId,
//     dyteSession.doctorAuthId,
//     dyteSession.userAuthId,
//     'doctor'
//   );
//   return { videoToken, roomName, chatExchangeToken };
// };

// const joinAppointmentPatient = async (appointmentId) => {
//   const appointment = await Appointment.findById({ _id: appointmentId });
//   if (!appointment) {
//     throw new ApiError(400, 'Cannot Initiate Appointment Session');
//   }

//   // Dyte Service
//   const dyteSession = await DyteService.createDyteMeeting(appointmentId, appointment.doctorAuthId, appointment.userAuthId);
//   if (!dyteSession) {
//     throw new ApiError(400, 'Error Generating Video Session, Maybe, You do not have access to this Appointment');
//   }

//   const videoToken = dyteSession.dyteusertoken;
//   const roomName = dyteSession.dyteroomname;

//   const chatExchangeToken = tokenService.generateChatAppointmentSessionToken(
//     dyteSession.appointmentId,
//     dyteSession.doctorAuthId,
//     dyteSession.userAuthId,
//     'user'
//   );
//   return { videoToken, roomName, chatExchangeToken };
// };

const ScheduleSessionJob = async (appointmentId, startTime) => {
  const datetime = startTime.getTime() - 300000; // Scheduling Job 5mins before Appointment
  agenda.define('createSessions', async (job) => {
    const { appointment } = job.attrs.data;
    await initiateAppointmentSession(appointment);
  });
  // const jobScheduled = await agenda.schedule(Date.now() + 1000, 'createSessions', { appointment: appointmentId }); // Scheduling a Job in Agenda for NOW
  // CHANGE IT TO 5 MINS BEFORE APPOINTMENT:
  const jobScheduled = await agenda.schedule(datetime, 'createSessions', { appointment: appointmentId }); // Scheduling a Job in Agenda
  return jobScheduled;
};

const weekday = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const bookAppointment = async (
  docid,
  userAuthId,
  slotId,
  date,
  bookingType,
  issue,
  patientname,
  patientmobile,
  patientmail
) => {
  const userBasic = await UserBasic.findOne({ auth: userAuthId });
  const currentDate = new Date().toDateString();
  const bookingDate = new Date(date).toDateString();

  if (bookingType === 'LIVE') {
    if (currentDate !== bookingDate) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Your'e booking for a future Date .Choose 'PREBOOKING' insted of 'LIVE' ");
    }
  }

  if (bookingType === 'PREBOOKING') {
    if (currentDate === bookingDate) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Your'e booking for a current Date .Choose 'LIVE' insted of 'PREBOOKING' ");
    }
  }

  let Gender = '';
  let age = 0;
  if (userBasic) {
    Gender = userBasic.gender;
    age = new Date().getFullYear() - userBasic.dob.getFullYear();
  } else {
    // throw new ApiError(
    //   httpStatus.BAD_REQUEST,
    //   'IN ORDER TO COMPLETE YOUR APPOINTMENT BOOKING YOU NEED TO COMPLETE YOUR BASIC PROFILE FIRST !'
    // );
  }
  let startTime = null;
  let endTime = null;
  let doctorBasic;
  try {
    doctorBasic = await DoctorBasic.findOne({ verifiedDoctorId: docid });
  } catch (err) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Doctor not found');
  }
  // const doctorAuth = await Auth.findById(doctorBasic.auth);
  // console.log(doctorAuth)

  const doctorname = doctorBasic.fullName || 'Doctor';
  const appointmentPrice = doctorBasic.appointmentPrice;

  await AppointmentPreference.findOne({ docid }).then((pref) => {
    const day = slotId.split('-')[0];
    const slots = pref[`${day}`];
    const slot = slots.filter((e) => e.slotId === slotId);
    if (slot.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Slot not found');
    }
    startTime = new Date(`${date} ${slot[0].FromHour}:${slot[0].FromMinutes}:00 GMT+0300`);
    endTime = new Date(`${date} ${slot[0].ToHour}:${slot[0].ToMinutes}:00 GMT+0300`);
    const currentTime = new Date();
    const correctDay = startTime.getDay();
    const requestedDay = slotId.split('-')[0];
    if (weekday[correctDay] !== requestedDay) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Requested weekday doesn't matches the given date");
    }
    if (startTime.getTime() <= currentTime.getTime()) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Appointments can be booked only for future dates');
    }
  });

  const appointmentExist = await Appointment.findOne({ docid, StartTime: startTime, paymentStatus: 'PAID' }).exec();
  if (appointmentExist || startTime === null || endTime === null) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Appointment Already Booked');
  }
  const orderid = `MDZGX${Math.floor(Math.random() * 10)}${short.generate().toUpperCase()}`;
  const bookedAppointment = await Appointment.create({
    doctorAuthId: doctorBasic.doctorAuthId,
    docid,
    doctorName: doctorname,
    slotId,
    userAuthId,
    Type: bookingType,
    Date: bookingDate,
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
  bookedAppointment.chatHistory = {};
  bookedAppointment.chatHistory.messages = [];
  bookedAppointment.chatHistory.appointmentId = bookedAppointment._id;
  const doctorProfilePic = doctorBasic.avatar;
  const userProfilePic = userBasic.avatar;
  const participants = [
    { id: bookedAppointment.doctorAuthId, name: bookedAppointment.doctorName, profilePic: doctorProfilePic },
    { id: bookedAppointment.userAuthId, name: bookedAppointment.patientName, profilePic: userProfilePic },
  ];
  bookedAppointment.chatHistory.participants = [...participants];
  await bookedAppointment.save();
  agenda.start();
  await ScheduleSessionJob(bookedAppointment.id, bookedAppointment.StartTime);
  return { id: bookedAppointment.id, orderId: bookedAppointment.orderId };
};

const getUpcomingAppointments = async (doctorId, fromDate, endDate, options) => {
  const res = await Appointment.paginate(
    {
      docid: doctorId,
      paymentStatus: 'PAID',
      Status: { $nin: 'cancelled' },
      StartTime: { $gte: fromDate, $lt: endDate },
    },
    options
  );
  return res;
};

const getAppointmentsByType = async (doctorId, fromDate, endDate, filter, options) => {
  if (filter.Type === 'ALL') {
    const result = await Appointment.paginate({ docid: doctorId, paymentStatus: 'PAID' }, options);
    return result;
  }
  if (filter.Type === 'TODAY') {
    const result = await Appointment.paginate(
      {
        docid: doctorId,
        paymentStatus: 'PAID',
        Date: new Date().toDateString(),
      },
      options
    );
    return result;
  }
  if (filter.Type === 'UPCOMING') {
    const result = await Appointment.paginate(
      {
        docid: doctorId,
        paymentStatus: 'PAID',
        StartTime: { $gte: new Date(), $lt: endDate },
      },
      options
    );
    return result;
  }
  if (filter.Type === 'PAST') {
    const result = await Appointment.paginate(
      {
        docid: doctorId,
        paymentStatus: 'PAID',
        StartTime: { $gte: fromDate, $lt: new Date() },
      },
      options
    );
    return result;
  }

  const result = await Appointment.paginate(
    {
      docid: doctorId,
      paymentStatus: 'PAID',
      StartTime: { $gte: fromDate, $lt: endDate },
      Type: filter.Type,
    },
    options
  );
  return result;
};

const getAppointmentsByStatus = async (doctorId, fromDate, endDate, filter, options) => {
  try {
    if (filter.Status === 'ALL') {
      const result = await Appointment.paginate({ docid: doctorId, paymentStatus: 'PAID' }, options);
      return result;
    }
    if (filter.Status === 'TODAY') {
      const result = await Appointment.paginate(
        {
          docid: doctorId,
          paymentStatus: 'PAID',
          StartTime: { $gte: fromDate, $lt: endDate },
          Date: new Date().toDateString(),
        },
        options
      );
      return result;
    }
    if (filter.Status === 'PAST') {
      const result = await Appointment.paginate(
        { docid: doctorId, paymentStatus: 'PAID', StartTime: { $gte: fromDate, $lt: new Date() } },
        options
      );
      return result;
    }
    if (filter.Status === 'UPCOMING') {
      const result = await Appointment.paginate(
        {
          docid: doctorId,
          paymentStatus: 'PAID',
          Status: { $nin: 'cancelled' },
          StartTime: { $gte: new Date(), $lt: endDate },
        },
        options
      );
      return result;
    }
    if (filter.Status === 'CANCELLED') {
      const result = await Appointment.paginate(
        {
          docid: doctorId,
          paymentStatus: 'PAID',
          Status: 'cancelled',
        },
        options
      );
      return result;
    }
    // else
    const result = await Appointment.paginate(
      {
        docid: doctorId,
        paymentStatus: 'PAID',
        StartTime: { $gte: fromDate, $lt: endDate },
        Status: filter.Type,
      },
      options
    );
    return result;
  } catch (er) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No appointments found with this id');
  }
};

// const allAppointments = async (doctorId, fromDate, endDate, options) => {
//   try {
//     const followup = await Appointment.paginate(
//       { docid: doctorId, Type: 'FOLLOWUP', Status: { $nin: 'cancelled' }, StartTime: { $gte: fromDate, $lt: endDate } },
//       options
//     );
//     const cancelled = await Appointment.paginate(
//       { Status: 'cancelled', docid: doctorId, StartTime: { $gte: fromDate, $lt: endDate } },
//       options
//     );
//     const past = await Appointment.paginate(
//       {
//         StartTime: { $gte: fromDate, $lt: new Date() },
//         paymentStatus: 'PAID',
//         docid: doctorId,
//         Status: { $nin: 'cancelled' },
//       },
//       options
//     );
//     const today = await Appointment.paginate(
//       {
//         StartTime: { $gte: fromDate, $lt: endDate },
//         Date: new Date().toDateString(),
//         paymentStatus: 'PAID',
//         Status: { $nin: 'cancelled' },
//         docid: doctorId,
//       },
//       options
//     );
//     const referred = await Appointment.paginate(
//       { docid: doctorId, Type: 'REFERRED', paymentStatus: 'PAID', Status: { $nin: 'cancelled' } },
//       options
//     );
//     const upcoming = await Appointment.paginate(
//       {
//         docid: doctorId,
//         paymentStatus: 'PAID',
//         Status: { $nin: 'cancelled' },
//         StartTime: { $gte: new Date(), $lt: endDate },
//       },
//       options
//     );
//     const data = { followup, today, cancelled, past, referred, upcoming };
//     return data;
//   } catch (error) {
//     return error;
//   }
// };

// const getFollowupsById = async (limit) => {
//   const count = parseInt(limit, 10);
//   const result = await Followup.find()
//     .sort([['StartTime', 1]])
//     .limit(count);
//   return result;
// };

const getAvailableAppointments = async (doctorId) => {
  const AllAppointmentSlots = await appointmentPreferenceService.getAppointmentPreferences(doctorId);
  if (!AllAppointmentSlots) {
    throw new ApiError(httpStatus.NO_CONTENT, 'No Appointment Slots Found');
  }
  const bookedAppointmentSlots = await Appointment.find({ doctorAuthId: doctorId, paymentStatus: 'PAID' });

  if (!bookedAppointmentSlots) {
    const availableAppointmentSlots = AllAppointmentSlots;
    return availableAppointmentSlots;
  }

  // Now we can safely access the length property
  if (bookedAppointmentSlots.length === 0) {
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
  return availableAppointmentSlots;
};

const getAvailableAppointmentsManually = async (docid) => {
  const AllAppointmentSlots = await AppointmentPreference.findOne({ docid });
  if (!AllAppointmentSlots) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Appointment Slots Found');
  }
  const bookedAppointmentSlots = await Appointment.find({
    docid,
    paymentStatus: 'PAID',
    StartTime: { $gte: new Date(), $lte: new Date().getTime() + 7 * 24 * 60 * 60 * 1000 },
  });
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
  return availableAppointmentSlots;
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

const createPrescription = async (prescriptionDoc, appointmentId, Authdata) => {
  try {
    const appointment = await Appointment.findOne({ _id: appointmentId });
    prescriptionDoc.Appointment = appointmentId;
    prescriptionDoc.patientName = appointment.patientName;
    prescriptionDoc.doctorName = appointment.doctorName;
    prescriptionDoc.appointmentDate = appointment.Date;
    prescriptionDoc.userAuth = appointment.userAuthId || '644d818a46205e53b648df51';
    prescriptionDoc.doctorAuth = Authdata;
    const prescriptionUrl = await documentService.generatePrescriptionDocument(prescriptionDoc);
    prescriptionDoc.prescriptionUrl = prescriptionUrl;

    const prescription = await Prescription.create(prescriptionDoc);
    if (prescription) {
      return prescription;
    }
  } catch (e) {
    return false;
  }
};

const getPatientDetails = async (patientId, doctorId) => {
  const [PatientAuth, PatientBasicDetails, appointments, prescription] = await Promise.all([
    authService.getAuthById(patientId),
    UserBasic.findOne({ auth: patientId }, { auth: 0 }),
    Appointment.findOne({
      userAuthId: patientId,
      StartTime: { $lt: new Date() },
      paymentStatus: 'PAID',
      doctorAuthId: doctorId,
    }).sort({ StartTime: -1 }),
    Prescription.findOne({ Appointment: patientId }).sort({ createdAt: -1 }),
  ]);

  const PatientName = PatientAuth.fullname;
  const PatientContact = { mobile: PatientAuth.mobile, email: PatientAuth.email };
  const RecentAppointment = appointments;
  const LatestPrescription = prescription;

  return [PatientName, PatientBasicDetails, PatientContact, RecentAppointment, LatestPrescription];
};

const getTotalRevenue = async (doctorAuthId) => {
  const appointments = await Appointment.find({ doctorAuthId, paymentStatus: 'PAID', Type: 'PAST' });
  if (!appointments) return 0;
  const appoinmentPrices = appointments.map((appointment) => appointment.price);
  const totalRevenue = appoinmentPrices.reduce((sum, x) => sum + x);
  return totalRevenue;
};

const getTotalIncome = async (doctorAuthId) => {
  const appointments = await Appointment.find({ doctorAuthId, paymentStatus: 'PAID', Type: 'PAST' });
  if (!appointments) return 0;
  const appointmentIncomes = appointments.map((appointment) => netEarn(appointment.price));
  const totalIncome = appointmentIncomes.reduce((sum, x) => sum + x);
  return totalIncome;
};

const getPatientsCount = async (doctorAuthId) => {
  const appointments = await Appointment.find({ doctorAuthId });
  const patientIds = appointments.map((appointment) => appointment.userAuthId.toString());
  // convert objectId to String because objectIds aren't comparable (Set will consider duplicates as uniques)
  return new Set(patientIds).size;
};

const getPastPaidAppointments = async (doctorAuthId) => {
  const appointments = await Appointment.find({ doctorAuthId });
  const pastPaidAppointments = appointments.filter(
    (appointment) => appointment.paymentStatus === 'PAID' && appointment.Status !== 'CANCELLED'
  );
  pastPaidAppointments.sort((a, b) => new Date(b.StartTime) - new Date(a.StartTime)); // sort by date (descending)
  return pastPaidAppointments;
};

const getPatients = async (doctorid, page, limit, sortBy) => {
  // Get patientIds based on doctorId
  const patientIds = await Appointment.aggregate([
    { $match: { docid: doctorid } },
    { $sort: { StartTime: parseInt(sortBy, 10) } },
    { $group: { _id: '$userAuthId' } },
    { $skip: (parseInt(page, 10) - 1) * parseInt(limit, 10) },
    { $limit: parseInt(limit, 10) },
  ]);

  // Get patient details and appointment data for each patient
  const allPatientsData = await Promise.all(
    patientIds.map(async ({ _id: userAuthId }, index) => {
      const singlePatientData = await getPatientDetails(userAuthId, doctorid);
      return {
        'No.': index,
        'Patient Name': singlePatientData[0],
        'Patient Basic Details': singlePatientData[1],
        'Patient Contact Details': singlePatientData[2],
        'Patient Recent Appointment': singlePatientData[3],
        'Prescription ': singlePatientData[4],
      };
    })
  );

  // Get the total number of patients for pagination metadata
  const totalPatients = await Appointment.distinct('userAuthId', { docid: doctorid });
  const totalPages = Math.ceil(totalPatients.length / limit);

  const metadata = {
    total: totalPatients.length,
    totalPages,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  if (allPatientsData.length) {
    return [allPatientsData, metadata];
  }
  return false;
};

// const getAppointmentFeedback = async (appointmentId) => {
//   const feedbackData = await Feedback.findOne({ appointmentId });
//   return feedbackData;
// };

// // for statistics
// const getDoctorFeedbacks = async (doctorId) => {
//   const feedbackData = await Feedback.find({ doctorAuthId: doctorId });
//   return feedbackData;
// };

// // for statistics
// const getUserFeedbacks = async (userId) => {
//   const feedbackData = await Feedback.find({ userAuthId: userId });
//   return feedbackData;
// };

// // for particular appointment
// const getDoctorFeedback = async (feedbackDoc, appointmentId) => {
//   const feedbackData = await Feedback.findOne({ appointmentId });
//   const { userAuthId, doctorAuthId } = await Appointment.findById(appointmentId);
//   if (feedbackData) {
//     await Feedback.findOneAndUpdate(
//       { appointmentId },
//       { $set: { doctorAuthId, userAuthId, userRating: feedbackDoc.userRating, userDescription: feedbackDoc.userDescription } },
//       { useFindAndModify: false }
//     );
//     return { message: 'feedback added sucessfully' };
//   }
//   feedbackDoc.appointmentId = appointmentId;
//   const DoctorNotifications = await Feedback.create(feedbackDoc);
//   if (DoctorNotifications) {
//     return { message: 'feedback added sucessfully', feedbackDoc };
//   }
//   return false;
// };

// // for particular appointment
// const getUserFeedback = async (feedbackDoc, appointmentId) => {
//   const feedbackData = await Feedback.findOne({ appointmentId });
//   const { userAuthId, doctorAuthId } = await Appointment.findById(appointmentId);

//   if (feedbackData) {
//     await Feedback.findOneAndUpdate(
//       { appointmentId },
//       {
//         $set: {
//           doctorAuthId,
//           userAuthId,
//           doctorRating: feedbackDoc.doctorRating,
//           doctorDescription: feedbackDoc.doctorDescription,
//         },
//       },
//       { useFindAndModify: false }
//     );
//     return { message: 'feedback added sucessfully' };
//   }
//   feedbackDoc.appointmentId = appointmentId;
//   const DoctorNotifications = await Feedback.create(feedbackDoc);
//   if (DoctorNotifications) {
//     return { message: 'feedback added sucessfully', feedbackDoc };
//   }
//   return false;
// };

const cancelAppointment = async (appointmentId, doctorId) => {
  const appointment = await Appointment.findById({ _id: appointmentId });
  if (appointment.Status !== 'cancelled') {
    await Appointment.findOneAndUpdate({ _id: appointmentId }, { Status: 'cancelled' }, { new: true });
    await emailService.bookingCancellationMail(appointment);
    const result = await Appointment.find({ doctorAuthId: doctorId });
    return result;
  }
  // await emailService.sendEmail({
  //   from: process.env.EMAIL_FROM,
  //   to: appointment.patientMail,
  //   subject: 'Cancelled Appointment',
  //   text: `hi !\nthis mail is to inform you that your appointment (${appointmentId}) has been cancelled since doctor is not available at this time \n\n\nThank you Team Medzgo`,
  // });

  return 'appintment already cancelled';
};

// const rescheduleAppointment = async (doctorId, appointmentId, slotId, date, RescheduledReason, sendMailToUser) => {
//   let emailSent = true;
//   const appointment = await Appointment.findById({ _id: appointmentId, docid: doctorId });
//   if (!appointment) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Appointment doesn't exist");
//   }
//   const appointmentPreferences = await AppointmentPreference.findOne({ docid: doctorId });
//   const day = slotId.split('-')[0];
//   const rescheduledDay = new Date(date).toDateString().toUpperCase().split(' ')[0];
//   if (day !== rescheduledDay) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Requested weekday doesn't matches the given date");
//   }
//   const slots = appointmentPreferences[`${day}`];
//   const slot = slots.filter((e) => e.slotId === slotId);
//   const startTime = new Date(`${date} ${slot[0].FromHour}:${slot[0].FromMinutes}:00 GMT+0530`);
//   const endTime = new Date(`${date} ${slot[0].ToHour}:${slot[0].ToMinutes}:00 GMT+0530`);
//   const currentTime = new Date();
//   if (startTime.getTime() <= currentTime.getTime()) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Appointments can be booked only for future dates');
//   }
//   if (startTime === null || endTime === null) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Error in creating timestamps!');
//   }
//   const appointmentTime = new Date(date).getTime();
//   const timeDifference = Math.round((appointmentTime - currentTime.getTime()) / (1000 * 3600 * 24));
//   if (timeDifference >= 6) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       'youre only allowed to reschedule your appointment within 6 days from current day'
//     );
//   }
//   const appointmentDate = new Date(date).toDateString();
//   const todayDate = new Date().toDateString();
//   if (`${todayDate}` === `${appointmentDate}`) {
//     appointment.type = 'TODAY';
//   }
//   appointment.RescheduledReason = RescheduledReason;
//   appointment.slotId = slotId;
//   appointment.Date = appointmentDate;
//   appointment.StartTime = startTime;
//   appointment.EndTime = endTime;
//   appointment.Status = 'rescheduled';
//   await appointment.save();

//   const result = await Appointment.find({ docid: doctorId });
//   if (appointment.patientMail && sendMailToUser === true) {
//     const time = ` ${date} ${slot[0].FromHour}:${slot[0].FromMinutes} to ${slot[0].ToHour}:${slot[0].ToMinutes}`;
//     await emailService.sendRescheduledEmail(appointment.patientMail, time, RescheduledReason, appointmentId);
//   } else {
//     emailSent = false;
//   }
//   return { result, emailSent };
// };

const getDoctorsByCategories = async (category, filter, options) => {
  const Doctordetails = await DoctorBasic.paginate({ specializations: { $in: [category] }, Slots: { $ne: null } }, options);
  if (Doctordetails.length <= 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No doctors found in this category');
  }
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  if (filter.Availability === 'TODAY') {
    // eslint-disable-next-line no-shadow
    const today = days[new Date().getDay()];
    if (filter.Gender && filter.Languages) {
      const Doctors = await DoctorBasic.paginate(
        {
          specializations: { $in: [category] },
          [`Slots.${today}`]: { $ne: [] },
          Experience: { $gte: filter.FromExperience, $lte: filter.ToExperience },
          Languages: { $in: [filter.Languages] },
          Gender: filter.Gender,
          appointmentPrice: { $gte: filter.StartPrice, $lte: filter.EndPrice },
        },
        options
      );
      return Doctors;
    }
    if (filter.Gender || filter.Languages) {
      const Doctors = await DoctorBasic.paginate(
        {
          specializations: { $in: [category] },
          [`Slots.${today}`]: { $ne: [] },
          $or: [{ Languages: { $in: [filter.Languages] } }, { Gender: filter.Gender }],
          appointmentPrice: { $gte: filter.StartPrice, $lte: filter.EndPrice },
        },
        options
      );
      return Doctors;
    }
    const Doctors = await DoctorBasic.paginate(
      {
        specializations: { $in: [category] },
        [`Slots.${today}`]: { $ne: [] },
        Experience: { $gte: filter.FromExperience, $lte: filter.ToExperience },
        appointmentPrice: { $gte: filter.StartPrice, $lte: filter.EndPrice },
      },
      options
    );
    return Doctors;
  }
  // eslint-disable-next-line no-else-return
  else if (filter.Availability === 'TOMORROW') {
    // eslint-disable-next-line no-shadow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = days[tomorrow.getDay()];
    if (filter.Gender && filter.Languages) {
      const Doctors = await DoctorBasic.paginate(
        {
          specializations: { $in: [category] },
          [`Slots.${tomorrowDay}`]: { $ne: [] },
          Experience: { $gte: filter.FromExperience, $lte: filter.ToExperience },
          Languages: { $in: [filter.Languages] },
          Gender: filter.Gender,
          appointmentPrice: { $gte: filter.StartPrice, $lte: filter.EndPrice },
        },
        options
      );
      return Doctors;
    }
    if (filter.Gender || filter.Languages) {
      const Doctors = await DoctorBasic.paginate(
        {
          specializations: { $in: [category] },
          [`Slots.${tomorrowDay}`]: { $ne: [] },
          Experience: { $gte: filter.FromExperience, $lte: filter.ToExperience },
          $or: [{ Gender: filter.Gender }, { Languages: { $in: [filter.Languages] } }],
          appointmentPrice: { $gte: filter.StartPrice, $lte: filter.EndPrice },
        },
        options
      );
      return Doctors;
    }
    const Doctors = await DoctorBasic.paginate(
      {
        specializations: { $in: [category] },
        [`Slots.${tomorrowDay}`]: { $ne: [] },
        Experience: { $gte: filter.FromExperience, $lte: filter.ToExperience },
        appointmentPrice: { $gte: filter.StartPrice, $lte: filter.EndPrice },
      },
      options
    );
    return Doctors;
  } else if (filter.Availability === 'NEXT 3 DAYS') {
    const today = new Date();
    const tom = new Date(today);
    tom.setDate(tom.getDate() + 1);
    const getDay = (tomorrow) => {
      let dayafter;
      let daylater;
      if (tomorrow === 6) {
        dayafter = 0;
        daylater = 1;
      } else if (tomorrow === 5) {
        dayafter = 6;
        daylater = 0;
      } else {
        dayafter = tomorrow + 1;
        daylater = tomorrow + 2;
      }
      return { tomorrow: days[tomorrow], dayafter: days[dayafter], daylater: days[daylater] };
    };
    const getday = getDay(tom.getDay());
    if (filter.Gender && filter.Languages) {
      const Doctors = await DoctorBasic.paginate(
        {
          specializations: { $in: [category] },
          $or: [
            { [`Slots.${getday.tomorrow}`]: { $ne: [] } },
            { [`Slots.${getday.dayafter}`]: { $ne: [] } },
            { [`Slots.${getday.daylater}`]: { $ne: [] } },
          ],
          Experience: { $gte: filter.FromExperience, $lte: filter.ToExperience },
          Languages: { $in: [filter.Languages] },
          Gender: filter.Gender,
          appointmentPrice: { $gte: filter.StartPrice, $lte: filter.EndPrice },
        },
        options
      );
      return Doctors;
    }
    if (filter.Gender) {
      const Doctors = await DoctorBasic.paginate(
        {
          specializations: { $in: [category] },
          $or: [
            { [`Slots.${getday.tomorrow}`]: { $ne: [] } },
            { [`Slots.${getday.dayafter}`]: { $ne: [] } },
            { [`Slots.${getday.daylater}`]: { $ne: [] } },
          ],
          Experience: {
            $gte: filter.FromExperience,
            $lte: filter.ToExperience,
          },
          Gender: filter.Gender,
          appointmentPrice: { $gte: filter.StartPrice, $lte: filter.EndPrice },
        },
        options
      );
      return Doctors;
    }
    if (filter.Languages) {
      const Doctors = await DoctorBasic.paginate(
        {
          specializations: { $in: [category] },
          $or: [
            { [`Slots.${getday.tomorrow}`]: { $ne: [] } },
            { [`Slots.${getday.dayafter}`]: { $ne: [] } },
            { [`Slots.${getday.daylater}`]: { $ne: [] } },
          ],
          Experience: {
            $gte: filter.FromExperience,
            $lte: filter.ToExperience,
          },
          Languages: { $in: [`${filter.Languages}`] },
          appointmentPrice: { $gte: filter.StartPrice, $lte: filter.EndPrice },
        },
        options
      );
      return Doctors;
    }
    const Doctors = await DoctorBasic.paginate(
      {
        specializations: { $in: [category] },
        $or: [
          { [`Slots.${getday.tomorrow}`]: { $ne: [] } },
          { [`Slots.${getday.dayafter}`]: { $ne: [] } },
          { [`Slots.${getday.daylater}`]: { $ne: [] } },
        ],
        Experience: { $gte: filter.FromExperience, $lte: filter.ToExperience },
        appointmentPrice: { $gte: filter.StartPrice, $lte: filter.EndPrice },
      },
      options
    );
    return Doctors;
  } else {
    if (filter.Gender && filter.Languages) {
      const Doctors = await DoctorBasic.paginate(
        {
          specializations: { $in: [category] },
          $or: [
            { 'Slots.MON': { $ne: [] } },
            { 'Slots.TUE': { $ne: [] } },
            { 'Slots.WED': { $ne: [] } },
            { 'Slots.THU': { $ne: [] } },
            { 'Slots.FRI': { $ne: [] } },
            { 'Slots.SAT': { $ne: [] } },
            { 'Slots.SUN': { $ne: [] } },
          ],
          Gender: filter.Gender,
          Languages: { $in: [filter.Languages] },
          Experience: { $gte: filter.FromExperience, $lte: filter.ToExperience },
          appointmentPrice: { $gte: filter.StartPrice, $lte: filter.EndPrice },
        },
        options
      );
      return Doctors;
    }
    if (filter.Gender) {
      const Doctors = await DoctorBasic.paginate(
        {
          specializations: { $in: [category] },
          $or: [
            { 'Slots.MON': { $ne: [] } },
            { 'Slots.TUE': { $ne: [] } },
            { 'Slots.WED': { $ne: [] } },
            { 'Slots.THU': { $ne: [] } },
            { 'Slots.FRI': { $ne: [] } },
            { 'Slots.SAT': { $ne: [] } },
            { 'Slots.SUN': { $ne: [] } },
          ],
          Gender: filter.Gender,
          Experience: { $gte: filter.FromExperience, $lte: filter.ToExperience },
          appointmentPrice: { $gte: filter.StartPrice, $lte: filter.EndPrice },
        },
        options
      );
      return Doctors;
    }
    if (filter.Languages) {
      const Doctors = await DoctorBasic.paginate(
        {
          specializations: { $in: [category] },
          $or: [
            { 'Slots.MON': { $ne: [] } },
            { 'Slots.TUE': { $ne: [] } },
            { 'Slots.WED': { $ne: [] } },
            { 'Slots.THU': { $ne: [] } },
            { 'Slots.FRI': { $ne: [] } },
            { 'Slots.SAT': { $ne: [] } },
            { 'Slots.SUN': { $ne: [] } },
          ],
          Languages: { $in: [filter.Languages] },
          Experience: { $gte: filter.FromExperience, $lte: filter.ToExperience },
          appointmentPrice: { $gte: filter.StartPrice, $lte: filter.EndPrice },
        },
        options
      );
      return Doctors;
    }
    const Doctors = await DoctorBasic.paginate(
      {
        specializations: { $in: [category] },
        $or: [
          { 'Slots.MON': { $ne: [] } },
          { 'Slots.TUE': { $ne: [] } },
          { 'Slots.WED': { $ne: [] } },
          { 'Slots.THU': { $ne: [] } },
          { 'Slots.FRI': { $ne: [] } },
          { 'Slots.SAT': { $ne: [] } },
          { 'Slots.SUN': { $ne: [] } },
        ],
        Experience: { $gte: filter.FromExperience, $lte: filter.ToExperience },
        appointmentPrice: { $gte: filter.StartPrice, $lte: filter.EndPrice },
      },
      options
    );
    return Doctors;
  }
};

const bookingConfirmation = async (orderId, appointmentId) => {
  const BookingDetails = await Appointment.findOne({ orderId });
  if (appointmentId === `${BookingDetails._id}`) {
    // EMAIL BOTH PATIENT AND DOCTOR ABOUT ORDER CONFIRMATION
    return { status: 'success', Message: 'Order confirmed', bookingDetails: BookingDetails, appointmentId };
  }
  return { status: 'failed', Message: 'Order not confirmed !' };
};

// const cancelFollowup = async (followupid) => {
//   const followup = await Followup.findById(followupid);
//   if (followup.Status === 'cancelled') {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       `cant cancel followup ,id :${followup.id} because this id was already cancelled`
//     );
//   }
//   await Followup.updateOne({ _id: followupid }, { $set: { Status: 'cancelled' } });
//   const { Status } = await Followup.findById(followupid);
//   if (Status === 'cancelled') {
//     return true;
//   }
//   return false;
// };

// const deleteSlot = async (doctorAuthId, slotId) => {
//   const appointmentPreferences = await AppointmentPreference.findOne({ doctorAuthId });
//   try {
//     const day = `${slotId.split('-')[0]}`;
//     appointmentPreferences[day] = appointmentPreferences[day].filter((slot) => {
//       return !slotId || slot.slotId !== slotId;
//     });
//     await appointmentPreferences.save();
//     return appointmentPreferences;
//   } catch (err) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Looks like this is not a valid slotId ,please enter a valid slotId');
//   }
// };

const getNextAppointmentDoctor = async (doctorId) => {
  try {
    const upcoming = await Appointment.find({
      docid: doctorId,
      Date: new Date().toDateString(),
      paymentStatus: 'PAID',
      Status: { $nin: 'cancelled' },
      StartTime: { $gte: new Date() },
    });
    const ongoing = await Appointment.find({
      docid: doctorId,
      Date: new Date().toDateString(),
      paymentStatus: 'PAID',
      Status: { $nin: 'cancelled' },
      StartTime: { $lte: new Date() },
    });
    if (ongoing.length === 0) {
      return upcoming[0];
    }
    const currenttime = new Date().toLocaleString().split(':')[1];
    const ongoingApp = new Date(`${ongoing[ongoing.length - 1].StartTime}`).toLocaleString().split(':')[1];
    if (currenttime >= ongoingApp) {
      if (currenttime - ongoingApp <= 10) {
        return ongoing[ongoing.length - 1];
      }
      return upcoming[0];
    }
    if (currenttime < ongoingApp) {
      const ongoingtime = 60 - ongoingApp + currenttime;
      if (ongoingtime >= 10) {
        return ongoing[ongoing.length - 1];
      }
      return upcoming[0];
    }
  } catch (err) {
    return null;
  }
};

module.exports = {
  initiateAppointmentSession,
  // joinAppointmentDoctor,
  // joinAppointmentPatient,
  bookAppointment,
  getUpcomingAppointments,
  getAppointmentsByType,
  getAvailableAppointments,
  // getFollowupsById,
  getAppointmentById,
  createPrescription,
  getPrescription,
  getPatientDetails,
  getPatients,
  // getUserFeedback,
  // getDoctorFeedback,
  cancelAppointment,
  // rescheduleAppointment,
  getDoctorsByCategories,
  bookingConfirmation,
  // cancelFollowup,
  // allAppointments,
  // deleteSlot,
  getPatientsCount,
  getTotalRevenue,
  // getAppointmentFeedback,
  // getDoctorFeedbacks,
  getPastPaidAppointments,
  getTotalIncome,
  getNextAppointmentDoctor,
  getAvailableAppointmentsManually,
  // getUserFeedbacks,
  getAppointmentsByStatus,
};
