const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { authService, verifiedDoctorService, internalTeamService, tokenService } = require('../services');

const verifydoctor = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await verifiedDoctorService.createVerifiedDoctor(req.body.docid, AuthData);
  res.status(httpStatus.CREATED).json({ message: 'Doctor Verified' });
});

const rejectdoctor = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const { docid, basicDetails, educationDetails, experienceDetails, payoutDetails, rejectionMsg } = req.body;
  await internalTeamService.rejectDoctorVerification(
    docid,
    AuthData,
    basicDetails,
    educationDetails,
    experienceDetails,
    payoutDetails,
    rejectionMsg
  );
  res.status(httpStatus.CREATED).json({ message: 'Doctor Verification Rejected Successfully!' });
});

const registeradmin = catchAsync(async (req, res) => {
  if (req.headers.secretadminkey !== process.env.SECRETADMINKEY || req.headers.secretadminkey === '') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Alarm Triggered! Suspected Activity Detected 🧐reach at security@medzgo.com 😒kyu bhai kya haal he Admin banega woh bhi bina permission? 😂'
    );
  } else {
    const AuthData = await authService.createAuthData(req.body);
    const authtoken = await tokenService.generateAdminToken(AuthData.id);
    const devicehash = req.headers.devicehash;
    const devicetype = req.headers.devicetype;
    const fcmtoken = req.headers.fcmtoken;
    await tokenService.addDeviceHandler(AuthData.id, authtoken, req.ip4, devicehash, devicetype, fcmtoken);
    res.status(httpStatus.CREATED).json({ AuthData, authtoken });
  }
});

const loginadmin = catchAsync(async (req, res) => {
  if (req.headers.secretadminkey !== process.env.SECRETADMINKEY || req.headers.secretadminkey === '') {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Alarm Triggered! Suspected Activity Detected 🧐reach at security@medzgo.com 😒kyu bhai kya haal he Admin banega woh bhi bina permission? 😂'
    );
  } else {
    const { email, password } = req.body;
    const AuthData = await authService.loginAuthWithEmailAndPassword(email, password);
    const authtoken = await tokenService.generateAdminToken(AuthData.id);
    const devicehash = req.headers.devicehash;
    const devicetype = req.headers.devicetype;
    const fcmtoken = req.headers.fcmtoken;
    await tokenService.addDeviceHandler(AuthData.id, authtoken, req.ip4, devicehash, devicetype, fcmtoken);
    res.status(httpStatus.OK).json({ AuthData, authtoken });
  }
});

const addDoctorDetails = catchAsync(async (req, res) => {
  const doctorDetails = await internalTeamService.addDoctorDetails(
    req.body.doctorname,
    req.body.doctorauthId,
    req.body.Experience,
    req.body.specializations,
    req.body.doctorDegree,
    req.body.doctorClinicAddress,
    req.body.appointmentPrice,
    req.body.doctorId,
    req.SubjectId
  );
  if (doctorDetails) {
    res.status(httpStatus.CREATED).json({ message: 'created', data: doctorDetails });
  } else {
    res.status(httpStatus[400]).json({ message: 'data that passed is not matching the requirements' });
  }
});

module.exports = {
  verifydoctor,
  rejectdoctor,
  registeradmin,
  loginadmin,
  addDoctorDetails,
};
