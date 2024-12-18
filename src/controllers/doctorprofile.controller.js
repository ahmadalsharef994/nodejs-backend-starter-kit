/* eslint-disable no-bitwise */
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const doctorprofileService = require('../services/doctorprofile.service');
const appointmentPreferenceService = require('../services/appointmentpreference.service');
const authDoctorController = require('./authdoctor.controller');
const { authService, documentService, appointmentService } = require('../services');
const netEarn = require('../utils/netEarnCalculator');
const pick = require('../utils/pick');
const daysDiff = require('../utils/calculateDays');

const getStats = catchAsync(async (req, res) => {
  const doctorId = req.SubjectId;

  const pastPaidAppointments = await appointmentService.getPastPaidAppointments(doctorId);
  const yesterdayDate = new Date(Date.now() - 86400000);

  const currentWeekAppointments = pastPaidAppointments.filter((appointment) => {
    const days = daysDiff(yesterdayDate.getTime(), new Date(appointment.Date).getTime());
    return days > 0 && days < 7;
  });

  const pastWeekAppointments = pastPaidAppointments.filter((appointment) => {
    const days = daysDiff(new Date(yesterdayDate.getTime() - 604800000).getTime(), new Date(appointment.Date).getTime());
    return days > 0 && days < 7;
  });

  const TOTAL_PATIENTS = await appointmentService.getPatientsCount(doctorId);
  const PERCENT_PATIENTS = 100 - (pastWeekAppointments.length / currentWeekAppointments.length) * 100 || 0;

  const TOTAL_REVENUE = pastPaidAppointments.reduce((sum, appointment) => sum + appointment.price, 0);
  const currentWeekRevenues = currentWeekAppointments.reduce((sum, appointment) => sum + appointment.price, 0);
  const pastWeekRevenues = pastWeekAppointments.reduce((sum, appointment) => sum + appointment.price, 0);
  const PERCENT_REVENUE = 100 - (pastWeekRevenues / currentWeekRevenues) * 100 || 0;

  const TOTAL_INCOME = pastPaidAppointments.reduce((sum, appointment) => sum + netEarn(appointment.price), 0);
  const currentWeekIncomes = currentWeekAppointments.reduce((sum, appointment) => sum + netEarn(appointment.price), 0);
  const pastWeekIncomes = pastWeekAppointments.reduce((sum, appointment) => sum + netEarn(appointment.price), 0);
  const PERCENT_INCOME = 100 - (pastWeekIncomes / currentWeekIncomes) * 100 || 0;

  const PATIENTS_CHART = new Array(7).fill(0);
  const REVENUE_CHART = new Array(7).fill(0);
  const INCOME_CHART = new Array(7).fill(0);

  currentWeekAppointments.forEach((appointment) => {
    const days = daysDiff(yesterdayDate.getTime(), new Date(appointment.Date).getTime());
    if (days > 0 && days < 7) {
      PATIENTS_CHART[6 - days] += 1;
      REVENUE_CHART[6 - days] += appointment.price;
      INCOME_CHART[6 - days] += netEarn(appointment.price);
    }
  });

  const AVERAGE_PATIENTS_PER_DAY = PATIENTS_CHART.reduce((sum, item) => sum + item, 0) / 7;
  const PATIENTS = { PERCENT_PATIENTS, TOTAL_PATIENTS, PATIENTS_CHART, AVERAGE_PATIENTS_PER_DAY };
  const REVENUE = { PERCENT_REVENUE, TOTAL_REVENUE, REVENUE_CHART };
  const INCOME = { PERCENT_INCOME, TOTAL_INCOME, INCOME_CHART };

  res.status(httpStatus.OK).send({ PATIENTS, REVENUE, INCOME });
});

const submitbasicdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const resultData = await doctorprofileService.submitbasicdetails(req.body, AuthData);
  const challenge = await authDoctorController.getOnboardingChallenge(AuthData);
  if (resultData !== false) {
    res.status(httpStatus.CREATED).json({
      message: 'Basic details Submitted',
      challenge,
      data: resultData,
    });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({
      message: 'Unknown Data  Submission Error',
      challenge,
    });
  }
});

// const submitprofilepicture = catchAsync(async (req) => {
//   const AuthData = await authService.getAuthById(req.SubjectId);
//   let profilePhoto = '';
//   try {
//     profilePhoto = req.files.avatar[0].location;
//   } catch (err) {
//     profilePhoto = null;
//   }
//   await doctorprofileService.submitprofilepicture(profilePhoto, req.SubjectId);
// });

const fetchbasicdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const basicDetails = await doctorprofileService.fetchbasicdetails(AuthData);
  if (!basicDetails) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Your OnBoarding is pending data submit');
  } else {
    res.status(httpStatus.OK).json({ message: 'success', data: basicDetails });
  }
});

const submiteducationdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await doctorprofileService.submiteducationdetails(req.body, AuthData);
  const challenge = await authDoctorController.getOnboardingChallenge(AuthData);
  res.status(httpStatus.CREATED).json({
    message: 'Education Details Submitted!',
    challenge,
  });
});

const fetcheducationdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const educationDetails = await doctorprofileService.fetcheducationdetails(AuthData);
  if (!educationDetails) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Your OnBoarding is pending data submit');
  } else {
    res.status(httpStatus.OK).json({ message: 'success', data: educationDetails });
  }
});

const submitexperiencedetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await doctorprofileService.submitexperiencedetails(req.body, AuthData);
  const challenge = await authDoctorController.getOnboardingChallenge(AuthData);
  res.status(httpStatus.CREATED).json({
    message: 'Experience Details Submitted!',
    challenge,
  });
});

const fetchexperiencedetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const experiencedata = await doctorprofileService.fetchexperiencedetails(AuthData);
  if (!experiencedata) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Your OnBoarding is pending data submit');
  } else {
    res.status(httpStatus.OK).json(experiencedata);
  }
});

const submitclinicdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const resultData = await doctorprofileService.submitedClinicdetails(req.body, AuthData);
  const challenge = await authDoctorController.getOnboardingChallenge(AuthData);
  if (!resultData) {
    res.status(httpStatus.BAD_REQUEST).json({
      message: 'Data already Submitted',
      challenge,
    });
  } else {
    res.status(httpStatus.CREATED).json({
      message: 'Clinic details Submitted',
      challenge,
      data: resultData,
    });
  }
});

const fetchclinicdetails = catchAsync(async (req, res) => {
  // const AuthData = await authService.getAuthById(req.SubjectId);
  const clinicdata = await doctorprofileService.fetchClinicdetails(req.SubjectId);
  if (!clinicdata) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Your OnBoarding is pending data submit');
  } else {
    res.status(httpStatus.OK).json(clinicdata);
  }
});

const submitpayoutsdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const payOutDetails = await doctorprofileService.submitpayoutsdetails(req.body, AuthData);
  res.status(httpStatus.CREATED).json({
    message: 'Payouts Details Submitted!',
    data: payOutDetails,
  });
});

const fetchpayoutsdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const payoutData = await doctorprofileService.fetchpayoutsdetails(AuthData);
  if (!payoutData) {
    throw new ApiError(httpStatus.NO_CONTENT, 'Your payoutData is pending data submit');
  } else {
    res.status(httpStatus.OK).json({ data: payoutData });
  }
});

const fetchprofiledetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const doctorBasicData = await doctorprofileService.fetchbasicdetails(AuthData);
  const doctorEducationData = await doctorprofileService.fetcheducationdetails(AuthData);
  const clinicData = await doctorprofileService.fetchClinicdetails(AuthData);
  const experienceData = await doctorprofileService.fetchexperiencedetails(AuthData);
  const appointmentPreference = await appointmentPreferenceService.getAppointmentPreferences(AuthData);
  const doctorDocumentData = await documentService.fetchDocumentdata(AuthData);
  if (!doctorBasicData) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'first create your account');
  } else {
    res.status(httpStatus.OK).json({
      'Basic Details': doctorBasicData,
      'Document Details': doctorDocumentData,
      'Education Details': doctorEducationData,
      'Experience Details': experienceData,
      'Clinic Details': clinicData,
      'Appointments Details': appointmentPreference,
    });
  }
});

// const addConsultationfee = catchAsync(async (req, res) => {
//   const AuthData = await authService.getAuthById(req.SubjectId);
//   const ConsultationData = await doctorprofileService.addConsultationfee(req.body, AuthData);
//   if (ConsultationData !== false) {
//     res.status(httpStatus.CREATED).json({ ConsultationData });
//   } else {
//     res.status(httpStatus.BAD_REQUEST).json({ message: 'Unable to add Consultation fee' });
//   }
// });

// const updateNotificationSettings = catchAsync(async (req, res) => {
//   const AuthData = await authService.getAuthById(req.SubjectId);
//   const notificationsData = await doctorprofileService.notificationSettings(req.body, AuthData);
//   if (notificationsData) {
//     res.status(httpStatus.CREATED).json({ notificationsData });
//   } else {
//     res.status(httpStatus.BAD_REQUEST).json({ message: 'Unable to change notification option' });
//   }
// });

// const updateClinicDetails = catchAsync(async (req, res) => {
//   const response = await doctorprofileService.updteClinicDetails(req.SubjectId, req.body.timing, req.body.clinicId);
//   if (response) {
//     res.status(httpStatus.OK).json({ message: `Clinic Timings Updated for ${response.clinicName} (id :${response.id})` });
//   } else {
//     res.status(httpStatus.BAD_REQUEST).json({ message: 'Clinic Details For This Id Not Found' });
//   }
// });

// const doctorExpandEducation = catchAsync(async (req, res) => {
//   const { Education, Experience } = await doctorprofileService.doctorExpEducation(
//     req.SubjectId,
//     req.body.experience,
//     req.body.education
//   );
//   const AuthData = await authService.getAuthById(req.SubjectId);
//   const challenge = await authDoctorController.getOnboardingChallenge(AuthData);
//   if (Education || Experience) {
//     res.status(httpStatus.CREATED).json({
//       message: 'Experience and Education Details Submitted!',
//       challenge: challenge.challenge,
//       optionalchallenge: challenge.optionalChallenge,
//     });
//   }
// });

// const updateDetails = catchAsync(async (req, res) => {
//   const result = await doctorprofileService.updateDetails(
//     req.body.about,
//     req.body.address,
//     req.body.pincode,
//     req.body.experience,
//     req.body.country,
//     req.body.state,
//     req.body.city,
//     req.SubjectId
//   );
//   if (result === true) {
//     res.status(httpStatus.OK).json({ message: 'Details Updated successfully' });
//   } else {
//     res.status(httpStatus.BAD_REQUEST).json({ message: 'something went wrong please contact our support team' });
//   }
// });

const updateAppointmentPrice = catchAsync(async (req, res) => {
  const result = await doctorprofileService.updateappointmentPrice(req.body.appointmentPrice, req.SubjectId);
  if (result === true) {
    res.status(httpStatus.OK).json({ message: 'appointmentPrice updated' });
  } else {
    res.status(httpStatus.OK).json({ message: 'appointmentPrice not updated try again' });
  }
});

// const getDoctorClinicTimings = catchAsync(async (req, res) => {
//   const result = await doctorprofileService.doctorClinicTimings(req.SubjectId);
//   if (result !== null) {
//     res.status(httpStatus.OK).json({ message: 'success', result });
//   } else {
//     res.status(httpStatus.BAD_REQUEST).json({ message: 'failed', reason: 'clinic timings not found' });
//   }

// });

// const sendDoctorQueries = catchAsync(async (req, res) => {
//   const AuthData = await authService.getAuthById(req.SubjectId);
//   const ticketDetails = await doctorprofileService.sendDoctorQueries(
//     req.SubjectId,
//     AuthData.email,
//     req.body.message,
//     AuthData.fullname
//   );
//   if (ticketDetails) {
//     res.status(httpStatus.OK).json({ message: 'query submitted successfully !', ticketDetails, emailSent: true });
//   } else {
//     res.status(httpStatus[404]).json({ message: 'failed to send query', ticketDetails, emailSent: false });
//   }
// });

const getBillingDetails = catchAsync(async (req, res) => {
  const doctorId = req.SubjectId;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : new Date('2022/01/01'); // example: 2022/04/26 ==> 2022-04-25T18:30:00.000Z;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date('2030/01/01');
  const billingDetails = await doctorprofileService.getBillingDetails(doctorId, fromDate, endDate, options);
  res.status(httpStatus.OK).json({
    message: `Billing details between ${fromDate} and ${endDate}`,
    data: billingDetails,
    totalPages: billingDetails.totalPages,
    page: billingDetails.page,
    limit: billingDetails.limit,
    totalResults: billingDetails.totalResults,
  });
});

// const getDoctorQueries = catchAsync(async (req, res) => {
//   const doctorQueries = await doctorprofileService.getDoctorQueries(req.SubjectId);
//   res.status(httpStatus.OK).json({ message: 'success', doctorQueries });
// });

module.exports = {
  getStats,
  submitbasicdetails,
  fetchbasicdetails,
  submiteducationdetails,
  fetcheducationdetails,
  submitclinicdetails,
  submitpayoutsdetails,
  fetchclinicdetails,
  // submitprofilepicture,
  submitexperiencedetails,
  fetchexperiencedetails,
  fetchpayoutsdetails,
  fetchprofiledetails,
  // addConsultationfee,
  // updateNotificationSettings,
  // updateClinicDetails,
  // updateDetails,
  // doctorExpandEducation,
  updateAppointmentPrice,
  // getDoctorClinicTimings,
  getBillingDetails,
  // sendDoctorQueries,
  // getDoctorQueries,
};
