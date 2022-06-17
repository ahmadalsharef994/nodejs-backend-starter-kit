/* eslint-disable no-bitwise */
const httpStatus = require('http-status');
// const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const doctorprofileService = require('../services/doctorprofile.service');
const appointmentPreferenceService = require('../services/appointmentpreference.service');
const authDoctorController = require('./authdoctor.controller');
// const profilePhotoUpload = require('../Microservices/profilePicture.service');
const { authService, documentService } = require('../services');

const getStats = catchAsync(async (req, res) => {
  const PERCENT = 2.6;
  const TOTAL_USER = 53; // totalPatients
  const CHART_DATA = [{ data: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26] }]; // what is chart data?
  const AveragePatientsPerDay = { PERCENT, TOTAL_USER, CHART_DATA };
  const PERCENTRevenue = 3.1; // what is
  const TOTALRevenue = 12000; // appointment - past - prices
  const CHARTRevenue = [{ data: [2, 32, 62, 3, 4, 12, 25, 23, 40, 43] }];
  const Revenue = { PERCENTRevenue, TOTALRevenue, CHARTRevenue };
  const PERCENTIncome = 12; // what
  const TOTALIncome = 8000; // what
  const CHARTIncome = [{ data: [32, 12, 13, 23, 34, 21, 76, 35, 24, 76] }];
  const Income = { PERCENTIncome, TOTALIncome, CHARTIncome };
  const Rating = 4.0; // appointments - past - feedbackmodel // Rating is float between 0.0 and 5.0, with only 1 digit after comma
  res.status(httpStatus.OK).send({ AveragePatientsPerDay, Revenue, Income, Rating });
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

// const updateprofilepicture = catchAsync(async (req, res) => {
//   const AuthData = await authService.getAuthById(req.SubjectId);
//   const returndata = await doctorprofileService.updateprofilepicture(req.files.avatar[0].location, AuthData);
//   try {
//     const returnThumbnail = await profilePhotoUpload.thumbnail(req.files.avatar[0].location);
//     if ((returndata !== false) & (returnThumbnail !== false)) {
//       res.status(httpStatus.OK).json({ message: 'profile picture updated' });
//     } else {
//       res.status(httpStatus.OK).json({ message: 'profile picture not updated kindlly check your input' });
//     }
//   } catch (err) {
//     throw new ApiError(httpStatus.NOT_FOUND, `profilePhotoUpload service: ${err}`);
//   }
// });

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
  const doctorBasicData = await doctorprofileService.fetchbasicdetails(AuthData, req.Docid);
  const doctorEducationData = await doctorprofileService.fetcheducationdetails(AuthData);
  const clinicData = await doctorprofileService.fetchClinicdetails(AuthData);
  const experienceData = await doctorprofileService.fetchexperiencedetails(AuthData);
  const appointmentPreference = await appointmentPreferenceService.getAppointmentPreferences(req.Docid, AuthData);
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
const sendDoctorQuries = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const ticketDetails = await doctorprofileService.sendDoctorQuries(
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
  // updateprofilepicture,
  fetchpayoutsdetails,
  fetchprofiledetails,
  addConsultationfee,
  notifications,
  updateClinicDetails,
  updateDetails,
  doctorExpandEducation,
  updateAppointmentPrice,
  getDoctorClinicTimings,
  sendDoctorQuries,
};
