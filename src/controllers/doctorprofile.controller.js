const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { doctorprofileService, authService } = require('../services');
const { BAD_REQUEST } = require('http-status');

const submitbasicdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await doctorprofileService.submitbasicdetails(req.body, AuthData);
  res.status(201).json("Basic Details Submitted!");
});

const fetchbasicdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const basicdata = await doctorprofileService.fetchbasicdetails(AuthData);
  if(!basicdata){
    throw new ApiError(BAD_REQUEST,"Your OnBoarding is pending data submit");
  }
  res.status(200).send(basicdata);
});

const submiteducationdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await doctorprofileService.submiteducationdetails(req.body, AuthData);
  res.status(201).json("Education Details Submitted!");
});

const fetcheducationdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const educationdata = await doctorprofileService.fetcheducationdetails(AuthData);
  if(!educationdata){
    throw new ApiError(BAD_REQUEST,"Your OnBoarding is pending data submit");
  }
  res.status(200).send(educationdata);
});


module.exports = {
  submitbasicdetails,
  fetchbasicdetails,
  submiteducationdetails,
  fetcheducationdetails,
};
