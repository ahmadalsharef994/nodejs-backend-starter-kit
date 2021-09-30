const { BAD_REQUEST } = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const doctorprofileService = require('../services/doctorprofile.service');
const authDoctorController = require('../controllers/authdoctor.controller');
const { authService } = require('../services');

const submitbasicdetails = async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const resultData = await doctorprofileService.submitbasicdetails(req.body, AuthData);
  const challenge = await authDoctorController.getOnboardingChallenge(AuthData);
  if(resultData != false){
    res.status(401).json({message:"Basic details Submitted", "challenge": challenge});
  }
  res.status(200).json({"message":"Data already Submitted", "challenge": challenge}); 
};

const submitprofilepicture = async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const returndata = await doctorprofileService.submitprofilepicture(req.files.avatar[0].location, AuthData);
  res.status(200).json(returndata);
};

const fetchbasicdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const basicdata = await doctorprofileService.fetchbasicdetails(AuthData);
  if (!basicdata) {
    throw new ApiError(BAD_REQUEST, 'Your OnBoarding is pending data submit');
  }
  res.status(200).json(basicdata);
});

const submiteducationdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await doctorprofileService.submiteducationdetails(req.body, AuthData);
  const challenge = await authDoctorController.getOnboardingChallenge(AuthData);
  res.status(201).json({"message":"Education Details Submitted!", "challenge": challenge});
});

const fetcheducationdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const educationdata = await doctorprofileService.fetcheducationdetails(AuthData);
  if (!educationdata) {
    throw new ApiError(BAD_REQUEST, 'Your OnBoarding is pending data submit');
  }
  res.status(200).json(educationdata);
});

const submitexperiencedetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await doctorprofileService.submitexperiencedetails(req.body, AuthData);
  const challenge = await authDoctorController.getOnboardingChallenge(AuthData);
  res.status(201).json({"message":"Experience Details Submitted!", "challenge": challenge});
});

const fetchexperiencedetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const educationdata = await doctorprofileService.fetchexperiencedetails(AuthData);
  if (!educationdata) {
    throw new ApiError(BAD_REQUEST, 'Your OnBoarding is pending data submit');
  }
  res.status(200).json(educationdata);
});

const submitclinicdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const resultData = await doctorprofileService.submitedClinicdetails(req.body, AuthData);
  const challenge = await authDoctorController.getOnboardingChallenge(AuthData);
  if(!resultData){
    res.status(401).json({"message":"Data already Submitted", "challenge": challenge});
  }else{
    res.status(200).json({"message":"Clinic details Submitted", "challenge": challenge}); 
  }
});

const fetchclinicdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const clinicdata = await doctorprofileService.fetchClinicdetails(AuthData);
  if (!clinicdata) {
    throw new ApiError(BAD_REQUEST, 'Your OnBoarding is pending data submit');
  }
  res.status(200).json(clinicdata);
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
