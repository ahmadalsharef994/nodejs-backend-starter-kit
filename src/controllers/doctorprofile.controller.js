/* eslint-disable no-bitwise */
const httpStatus = require('http-status');
// const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const doctorprofileService = require('../services/doctorprofile.service');
const appointmentPreferenceService = require('../services/appointmentpreference.service');
const authDoctorController = require('./authdoctor.controller');
const profilePhotoUpload = require('../Microservices/profilePhotoUpload');
const { authService } = require('../services');

const submitbasicdetails = async (req, res) => {
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
      message: 'Data already Submitted',
      challenge: challenge.challenge,
      optionalchallenge: challenge.optionalChallenge,
    });
  }
};

const submitprofilepicture = async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  let profilePhoto = '';
  try {
    profilePhoto = req.files.avatar[0].location;
  } catch (err) {
    profilePhoto = null;
  }
  const returnThumbnail = await profilePhotoUpload.thumbnail(profilePhoto);
  const returndata = await doctorprofileService.submitprofilepicture(profilePhoto, AuthData, returnThumbnail);
  if ((returndata !== false) & (returnThumbnail !== false)) {
    res.status(httpStatus.OK).json({ message: 'profile picture added' });
  } else {
    res.status(httpStatus.OK).json({ message: 'profile picture not added kindlly check your input' });
  }
};

const updateprofilepicture = async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const returndata = await doctorprofileService.updateprofilepicture(req.files.avatar[0].location, AuthData);
  const returnThumbnail = await profilePhotoUpload.thumbnail(req.files.avatar[0].location);
  if ((returndata !== false) & (returnThumbnail !== false)) {
    res.status(httpStatus.OK).json({ message: 'profile picture updated' });
  } else {
    res.status(httpStatus.OK).json({ message: 'profile picture not updated kindlly check your input' });
  }
};

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
  await doctorprofileService.submitpayoutsdetails(req.body, AuthData);
  res.status(httpStatus.CREATED).json({
    message: 'Payouts Details Submitted!',
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
  const appointmentPreference = await appointmentPreferenceService.getappointments(req.Docid, AuthData);
  if (!doctorBasicData) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'first create your account');
  } else {
    res.status(httpStatus.OK).json({
      'Basic Details': doctorBasicData,
      'Education Details': doctorEducationData,
      'Experience Details': experienceData,
      'Clinic Details': clinicData,
      'Appointments Details': appointmentPreference,
    });
  }
});

module.exports = {
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
  updateprofilepicture,
  fetchpayoutsdetails,
  fetchprofiledetails,
};
