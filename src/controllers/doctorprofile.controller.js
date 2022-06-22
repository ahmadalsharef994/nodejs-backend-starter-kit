/* eslint-disable no-bitwise */
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const doctorprofileService = require('../services/doctorprofile.service');
const appointmentPreferenceService = require('../services/appointmentpreference.service');
const authDoctorController = require('./authdoctor.controller');
const { authService, documentService, appointmentService } = require('../services');
const netEarnCalculator = require('../utils/netEarnCalculator');
const pick = require('../utils/pick');

const getStats = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const doctorAuthId = AuthData._id;

  const pastPaidAppointments = await appointmentService.getPastPaidAppointments(doctorAuthId);
  // const pickedProperties = (({ a, c }) => ({ a, c }))(pastPaidAppointments);
  // Date.prototype.getDateWithoutTime = () => new Date(this.toDateString());

  const todayDate = new Date();
  const pastSunday = (() => {
    const t = new Date().getDate() + (7 - new Date().getDay()) - 7;
    const pastFriday = new Date();
    pastFriday.setDate(t);
    return pastFriday;
  })();

  const past7DaysAppoitments = pastPaidAppointments.filter((appointment) => {
    const day1 = new Date(appointment.Date).getTime();
    const day2 = todayDate.getTime();
    const difference = day2 - day1;
    const days = Math.ceil(difference / (1000 * 3600 * 24));
    return days < 7 && days > 0; // 0 (today), 6 (7 days back)
  }); // CORRECT

  const pastWeekAppointments = pastPaidAppointments.filter((appointment) => {
    const day1 = new Date(appointment.Date).getTime();
    const day2 = pastSunday.getTime();
    const difference = day2 - day1;
    const days = Math.ceil(difference / (1000 * 3600 * 24));
    return days < 7 && days > 0;
  });

  // const allPatients = await appointmentService.getPatients(doctorId);
  const TOTAL_PATIENTS = await appointmentService.getPatientsCount(doctorAuthId);

  const PATIENTS_CHART = new Array(7).fill(0);
  past7DaysAppoitments.forEach((patient) => {
    const day1 = new Date(patient.Date).getTime(); // .getDateWithoutTime();
    const day2 = todayDate;
    const difference = day2 - day1;
    const days = Math.ceil(difference / (1000 * 3600 * 24));
    if (days > 0 && days < 7) PATIENTS_CHART[6 - days] += 1;
  });

  const PERCENT_PATIENTS = 100 - (pastWeekAppointments.length / past7DaysAppoitments.length) * 100;

  const PATIENTS = { PERCENT_PATIENTS, TOTAL_PATIENTS, PATIENTS_CHART }; // Done

  const TOTAL_REVENUE = await appointmentService.getTotalRevenue(AuthData._id); // DONE (incrome + medzgo charges)

  const past7DaysRevenues = past7DaysAppoitments
    .map((appointment) => appointment.price)
    .reduce((sum, revenue) => sum + revenue, 0);
  const pastWeekRevenues = pastWeekAppointments
    .map((appointment) => appointment.price)
    .reduce((sum, revenue) => sum + revenue, 0);

  const REVENUE_CHART = new Array(7).fill(0);
  past7DaysAppoitments.forEach((appointment) => {
    const day1 = new Date(appointment.Date).getTime();
    const day2 = todayDate;
    const difference = day2 - day1;
    const days = Math.ceil(difference / (1000 * 3600 * 24));
    if (days > 0 && days < 7) REVENUE_CHART[6 - days] += appointment.price;
  });

  const PERCENT_REVENUE = 100 - (pastWeekRevenues / past7DaysRevenues) * 100;
  const REVENUE = { PERCENT_REVENUE, TOTAL_REVENUE, REVENUE_CHART };

  const past7DaysIncomes = past7DaysAppoitments
    .map((appointment) => netEarnCalculator(appointment.price))
    .reduce((sum, income) => sum + income, 0);

  const pastWeekIncomes = pastWeekAppointments
    .map((appointment) => netEarnCalculator(appointment.price))
    .reduce((sum, income) => sum + income, 0);

  // appointmentsPast7Days.price --> appointmentsPast7Days.netEarn (- SERVICE_CHARGE, TAXES, TDS, DISCOUNT = 0)
  // appointmentsPast7Days.save
  const TOTAL_INCOME = await appointmentService.getTotalIncome(AuthData._id);
  const INCOME_CHART = new Array(7).fill(0);
  past7DaysAppoitments.forEach((appointment) => {
    const day1 = new Date(appointment.Date).getTime();
    const day2 = todayDate;
    const difference = day2 - day1;
    const days = Math.ceil(difference / (1000 * 3600 * 24));
    if (days > 0 && days < 7) INCOME_CHART[6 - days] += netEarnCalculator(appointment.price);
  });
  const PERCENT_INCOME = 100 - (pastWeekIncomes / past7DaysIncomes) * 100;

  const INCOME = { PERCENT_INCOME, TOTAL_INCOME, INCOME_CHART };
  const feedbacks = await appointmentService.getDoctorFeedbacks(AuthData._id);
  const RATING = (
    feedbacks.reduce((userRatingsSum, feedback) => {
      return userRatingsSum + feedback.userRating;
    }, 0) / feedbacks.length
  ).toFixed(1);

  // eslint-disable-next-line no-var
  res.status(httpStatus.OK).send({ PATIENTS, REVENUE, INCOME, RATING });
});

const submitbasicdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const resultData = await doctorprofileService.submitbasicdetails(req.body, AuthData);
  const challenge = await authDoctorController.getOnboardingChallenge(AuthData);
  if (resultData !== false) {
    res.status(httpStatus.CREATED).json({
      message: 'Basic details Submitted',
      challenge: challenge.challenge,
      optionalchallenge: challenge.optionalChallenge,
    });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({
      message: 'Unknown Data  Submission Error',
      challenge: challenge.challenge,
      optionalchallenge: challenge.optionalChallenge,
    });
  }
});

const submitprofilepicture = catchAsync(async (req) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  let profilePhoto = '';
  try {
    profilePhoto = req.files.avatar[0].location;
  } catch (err) {
    profilePhoto = null;
  }
  await doctorprofileService.submitprofilepicture(profilePhoto, AuthData);
});

const fetchbasicdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const basicdata = await doctorprofileService.fetchbasicdetails(AuthData);
  if (!basicdata) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Your OnBoarding is pending data submit');
  } else {
    res.status(httpStatus.OK).json(basicdata);
  }
});

const submiteducationdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await doctorprofileService.submiteducationdetails(req.body, AuthData);
  const challenge = await authDoctorController.getOnboardingChallenge(AuthData);
  res.status(httpStatus.CREATED).json({
    message: 'Education Details Submitted!',
    challenge: challenge.challenge,
    optionalchallenge: challenge.optionalChallenge,
  });
});

const fetcheducationdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const educationdata = await doctorprofileService.fetcheducationdetails(AuthData);
  if (!educationdata) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Your OnBoarding is pending data submit');
  } else {
    res.status(httpStatus.OK).json(educationdata);
  }
});

const submitexperiencedetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await doctorprofileService.submitexperiencedetails(req.body, AuthData);
  const challenge = await authDoctorController.getOnboardingChallenge(AuthData);
  res.status(httpStatus.CREATED).json({
    message: 'Experience Details Submitted!',
    challenge: challenge.challenge,
    optionalchallenge: challenge.optionalChallenge,
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
      challenge: challenge.challenge,
      optionalchallenge: challenge.optionalChallenge,
    });
  } else {
    res.status(httpStatus.CREATED).json({
      message: 'Clinic details Submitted',
      challenge: challenge.challenge,
      optionalchallenge: challenge.optionalChallenge,
      data: resultData,
    });
  }
});

const fetchclinicdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const clinicdata = await doctorprofileService.fetchClinicdetails(AuthData);
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
    throw new ApiError(httpStatus.BAD_REQUEST, 'Your OnBoarding is pending data submit');
  } else {
    res.status(httpStatus.OK).json({ 'Payout Details': payoutData });
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

const addConsultationfee = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const ConsultationData = await doctorprofileService.addConsultationfee(req.body, AuthData);
  if (ConsultationData !== false) {
    res.status(httpStatus.CREATED).json({ ConsultationData });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Unable to add Consultation fee' });
  }
});

const notifications = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const notificationsData = await doctorprofileService.notificationSettings(req.body, AuthData);
  if (notificationsData) {
    res.status(httpStatus.CREATED).json({ notificationsData });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Unable to change notification option' });
  }
});

const updateClinicDetails = catchAsync(async (req, res) => {
  const response = await doctorprofileService.updteClinicDetails(req.SubjectId, req.body.timing, req.body.clinicId);
  if (response) {
    res.status(httpStatus.OK).json({ message: `Clinic Timings Updated for ${response.clinicName} (id :${response.id})` });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Clinic Details For This Id Not Found' });
  }
});

const doctorExpandEducation = catchAsync(async (req, res) => {
  const { Education, Experience } = await doctorprofileService.doctorExpEducation(
    req.SubjectId,
    req.body.experience,
    req.body.education
  );
  const AuthData = await authService.getAuthById(req.SubjectId);
  const challenge = await authDoctorController.getOnboardingChallenge(AuthData);
  if (Education || Experience) {
    res.status(httpStatus.CREATED).json({
      message: 'Experience and Education Details Submitted!',
      challenge: challenge.challenge,
      optionalchallenge: challenge.optionalChallenge,
    });
  }
});

const updateDetails = catchAsync(async (req, res) => {
  const result = await doctorprofileService.updateDetails(
    req.body.about,
    req.body.address,
    req.body.pincode,
    req.body.experience,
    req.body.country,
    req.body.state,
    req.body.city,
    req.SubjectId
  );
  if (result === true) {
    res.status(httpStatus.OK).json({ message: 'Details Updated successfully' });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'something went wrong please contact our support team' });
  }
});

const updateAppointmentPrice = catchAsync(async (req, res) => {
  const result = await doctorprofileService.updateappointmentPrice(req.body.appointmentPrice, req.SubjectId);
  if (result === true) {
    res.status(httpStatus.OK).json({ message: 'appointmentPrice updated' });
  } else {
    res.status(httpStatus.OK).json({ message: 'appointmentPrice not updated try again' });
  }
});

const getDoctorClinicTimings = catchAsync(async (req, res) => {
  const result = await doctorprofileService.doctorClinicTimings(req.SubjectId);
  if (result !== null) {
    res.status(httpStatus.OK).json({ message: 'success', result });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'failed', reason: 'clinic timings not found' });
  }
});
const sendDoctorQueries = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const ticketDetails = await doctorprofileService.sendDoctorQueries(
    req.SubjectId,
    AuthData.email,
    req.body.message,
    AuthData.fullname
  );
  if (ticketDetails) {
    res.status(httpStatus.OK).json({ message: 'success', ticketDetails, emailSent: true });
  } else {
    res.status(httpStatus[404]).json({ message: 'failed to send query', ticketDetails, emailSent: false });
  }
});

const getBillingDetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const doctorAuthId = AuthData._id;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const billingDetails = await doctorprofileService.getBillingDetails(doctorAuthId, options);
  res.status(httpStatus.OK).json({ message: 'getting billing details', data: billingDetails });
});

const getDoctorQueries = catchAsync(async (req, res) => {
  const doctorQueries = await doctorprofileService.getDoctorQueries(req.SubjectId);
  res.status(httpStatus.OK).json({ doctorQueries });
});

module.exports = {
  getStats,
  submitbasicdetails,
  fetchbasicdetails,
  submiteducationdetails,
  fetcheducationdetails,
  submitclinicdetails,
  submitpayoutsdetails,
  fetchclinicdetails,
  submitprofilepicture,
  submitexperiencedetails,
  fetchexperiencedetails,
  fetchpayoutsdetails,
  fetchprofiledetails,
  addConsultationfee,
  notifications,
  updateClinicDetails,
  updateDetails,
  doctorExpandEducation,
  updateAppointmentPrice,
  getDoctorClinicTimings,
  getBillingDetails,
  sendDoctorQueries,
  getDoctorQueries,
};
