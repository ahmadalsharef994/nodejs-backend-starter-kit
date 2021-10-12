const httpStatus = require('http-status');
// const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const doctorprofileService = require('../services/doctorprofile.service');
const authDoctorController = require('./authdoctor.controller');
const { authService } = require('../services');

const submitbasicdetails = async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const resultData = await doctorprofileService.submitbasicdetails(req.body, AuthData);
  const challenge = await authDoctorController.getOnboardingChallenge(AuthData);
  if (resultData !== false) {
    res.status(httpStatus.CREATED).json({ message: 'Basic details Submitted', challenge });
  }
  res.status(httpStatus.BAD_REQUEST).json({ message: 'Data already Submitted', challenge });
};

const submitprofilepicture = async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const returndata = await doctorprofileService.submitprofilepicture(req.files.avatar[0].location, AuthData);
  res.status(httpStatus.OK).json(returndata);
};

const fetchbasicdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const basicdata = await doctorprofileService.fetchbasicdetails(AuthData);
  if (!basicdata) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Your OnBoarding is pending data submit');
  }
  res.status(httpStatus.OK).json(basicdata);
});

const submiteducationdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const educationsubmitdata = await doctorprofileService.submiteducationdetails(req.body, AuthData);
  const challenge = await authDoctorController.getOnboardingChallenge(AuthData);
  res.status(httpStatus.CREATED).json({ message: 'Education Details Submitted!', challenge });
});

const fetcheducationdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const educationdata = await doctorprofileService.fetcheducationdetails(AuthData);
  if (!educationdata) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Your OnBoarding is pending data submit');
  }
  res.status(httpStatus.OK).json(educationdata);
});

const submitexperiencedetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await doctorprofileService.submitexperiencedetails(req.body, AuthData);
  const challenge = await authDoctorController.getOnboardingChallenge(AuthData);
  res.status(httpStatus.CREATED).json({ message: 'Experience Details Submitted!', challenge });
});

const fetchexperiencedetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const educationdata = await doctorprofileService.fetchexperiencedetails(AuthData);
  if (!educationdata) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Your OnBoarding is pending data submit');
  }
  res.status(httpStatus.OK).json(educationdata);
});

const submitclinicdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const resultData = await doctorprofileService.submitedClinicdetails(req.body, AuthData);
  const challenge = await authDoctorController.getOnboardingChallenge(AuthData);
  if (!resultData) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Data already Submitted', challenge });
  } else {
    res.status(httpStatus.CREATED).json({ message: 'Clinic details Submitted', challenge });
  }
});

const fetchclinicdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const clinicdata = await doctorprofileService.fetchClinicdetails(AuthData);
  if (!clinicdata) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Your OnBoarding is pending data submit');
  }
  res.status(httpStatus.OK).json(clinicdata);
});

module.exports = {
  submitbasicdetails,
  fetchbasicdetails,
  submiteducationdetails,
  fetcheducationdetails,
  submitclinicdetails,
  fetchclinicdetails,
  submitprofilepicture,
  submitexperiencedetails,
  fetchexperiencedetails,
};
