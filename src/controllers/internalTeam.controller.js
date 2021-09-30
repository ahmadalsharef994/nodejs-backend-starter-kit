const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { authService, verifiedDoctorService, tokenService } = require('../services');

const verifydoctor = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await verifiedDoctorService.createVerifiedDoctor(req.body.docid, AuthData);
  res.status(201).json('Doctor Verified');
});

const registeradmin = catchAsync(async (req, res) => {
  if (req.headers.secretadminkey !== process.env.SECRETADMINKEY || req.headers.secretadminkey === '') {
    throw new ApiError(
      400,
      'Alarm Triggered! Suspected Activity Detected 🧐reach at security@medzgo.com 😒kyu bhai kya haal he Admin banega woh bhi bina permission? 😂'
    );
  } else {
    const AuthData = await authService.createAuthData(req.body);
    const authtoken = await tokenService.generateAdminToken(AuthData.id);
    const devicehash = req.headers.devicehash;
    const devicetype = req.headers.devicetype;
    const fcmtoken = req.headers.fcmtoken;
    await tokenService.addDeviceHandler(AuthData.id, authtoken, '1.1.1.1', devicehash, devicetype, fcmtoken);
    res.status(httpStatus.CREATED).send({ AuthData, authtoken });
  }
});

const loginadmin = catchAsync(async (req, res) => {
  if (req.headers.secretadminkey !== process.env.SECRETADMINKEY || req.headers.secretadminkey === '') {
    throw new ApiError(
      400,
      'Alarm Triggered! Suspected Activity Detected 🧐reach at security@medzgo.com 😒kyu bhai kya haal he Admin banega woh bhi bina permission? 😂'
    );
  } else {
    const { email, password } = req.body;
    const AuthData = await authService.loginAuthWithEmailAndPassword(email, password);
    const authtoken = await tokenService.generateAdminToken(AuthData.id);
    const devicehash = req.headers.devicehash;
    const devicetype = req.headers.devicetype;
    const fcmtoken = req.headers.fcmtoken;
    await tokenService.addDeviceHandler(AuthData.id, authtoken, '1.1.1.1', devicehash, devicetype, fcmtoken);
    res.json({ AuthData, authtoken });
  }
});

module.exports = {
  verifydoctor,
  registeradmin,
  loginadmin,
};
