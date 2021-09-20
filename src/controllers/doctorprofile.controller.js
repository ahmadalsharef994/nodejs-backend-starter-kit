const { BAD_REQUEST } = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const doctorprofileService = require('../services/doctorprofile.service');
const { authService } = require('../services');

const submitbasicdetails = async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const resultData = await doctorprofileService.submitbasicdetails(req.body, AuthData);
  if(resultData != false){
    res.status(401).send("Basic details Submitted");
  }
  res.status(200).send("Data already Submitted"); 
};

const submitprofilepicture = async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await doctorprofileService.submitprofilepicture(req.files.avatar[0].location, AuthData);
};

const fetchbasicdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const basicdata = await doctorprofileService.fetchbasicdetails(AuthData);
  if (!basicdata) {
    throw new ApiError(BAD_REQUEST, 'Your OnBoarding is pending data submit');
  }
  res.status(200).send(basicdata);
});

const submiteducationdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await doctorprofileService.submiteducationdetails(req.body, AuthData);
  res.status(201).json('Education Details Submitted!');
});

const fetcheducationdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const educationdata = await doctorprofileService.fetcheducationdetails(AuthData);
  if (!educationdata) {
    throw new ApiError(BAD_REQUEST, 'Your OnBoarding is pending data submit');
  }
  res.status(200).send(educationdata);
});

const submitexperiencedetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await doctorprofileService.submitexperiencedetails(req.body, AuthData);
  res.status(201).json('Experience Details Submitted!');
});

const fetchexperiencedetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const educationdata = await doctorprofileService.fetchexperiencedetails(AuthData);
  if (!educationdata) {
    throw new ApiError(BAD_REQUEST, 'Your OnBoarding is pending data submit');
  }
  res.status(200).send(educationdata);
});

const submitclinicdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const resultData = await doctorprofileService.submitedClinicdetails(req.body, AuthData);
  if(!resultData){
    res.status(401).send("Data already Submitted");
  }
  res.status(200).send("Clinic details Submitted"); 
});

const fetchclinicdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const clinicdata = await doctorprofileService.fetchClinicdetails(AuthData);
  if (!clinicdata) {
    throw new ApiError(BAD_REQUEST, 'Your OnBoarding is pending data submit');
  }
  res.status(200).send(clinicdata);
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
  fetchexperiencedetails
  
  
};
