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
    const AuthData = await authService.loginAuthWithEmailAndPasswordAdmin(email, password);
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

const unverifiedDoctors = catchAsync(async (req, res) => {
  const result = await internalTeamService.unverifiedDoctors();
  res.status(httpStatus.OK).json({ result });
});
const Doctorsprofile = catchAsync(async (req, res) => {
  const { fullname, basicDetails, educationDetails, clinicDetails, experienceDetails, documentDetails } =
    await internalTeamService.fetchDoctorProfile(req.query.id);
  if (basicDetails || educationDetails || clinicDetails || experienceDetails || documentDetails) {
    res.json({
      fullname,
      basicDetails,
      educationDetails,
      clinicDetails,
      experienceDetails,
      documentDetails,
    });
  }
});
const verifiedDoctors = catchAsync(async (req, res) => {
  const result = await internalTeamService.verfieddoctors();
  res.status(httpStatus.OK).json({ result });
});
const rejectedDoctors = catchAsync(async (req, res) => {
  const result = await internalTeamService.RejectedDoctors();
  res.status(httpStatus.OK).json({ result });
});

const setServiceCharges = catchAsync(async (req, res) => {
  const serviceCharges = req.body.serviceCharges; // validate: >0.1 and < 0.3
  const doctorAuthId = req.body.docid; // validate
  const response = await internalTeamService.setServiceCharges(doctorAuthId, serviceCharges);
  res.status(httpStatus.OK).json({ message: 'SERVICE CHARGES PERCENTAGE IS UPDATED', data: response });
});

module.exports = {
  verifydoctor,
  rejectdoctor,
  registeradmin,
  loginadmin,
  addDoctorDetails,
  unverifiedDoctors,
  Doctorsprofile,
  verifiedDoctors,
  rejectedDoctors,
  setServiceCharges,
};
