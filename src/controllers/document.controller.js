const httpStatus = require('http-status');
const { authService, documentService } = require('../services');
const authDoctorController = require('./authdoctor.controller');
const catchAsync = require('../utils/catchAsync');

const upload = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  let resume = '';
  try {
    resume = req.files.resume[0].key;
  } catch (err) {
    resume = null;
  }
  let esign = '';
  try {
    esign = req.files.esign[0].key;
  } catch (err) {
    esign = null;
  }
  let ifsc = '';
  try {
    ifsc = req.files.ifsc[0].key;
  } catch (err) {
    ifsc = null;
  }
  let medicalDegree = '';
  try {
    medicalDegree = req.files.medicalDegree[0].key;
  } catch (err) {
    medicalDegree = null;
  }
  let medicalRegistration = '';
  try {
    medicalRegistration = req.files.medicalRegistration[0].key;
  } catch (err) {
    medicalRegistration = null;
  }
  let aadharCardDoc = '';
  try {
    aadharCardDoc = req.files.aadharCardDoc[0].key;
  } catch (err) {
    aadharCardDoc = null;
  }
  let pancardDoc = '';
  try {
    pancardDoc = req.files.pancardDoc[0].key;
  } catch (err) {
    pancardDoc = null;
  }
  const DataQuery = await documentService.Upload(
    resume,
    esign,
    ifsc,
    medicalDegree,
    medicalRegistration,
    aadharCardDoc,
    pancardDoc,
    AuthData
  );
  const challenge = await authDoctorController.getOnboardingChallenge(AuthData);
  if (DataQuery !== false) {
    res.status(httpStatus.OK).json({
      message: 'Documents Uploaded',
      challenge: challenge.challenge,
      optionalchallenge: challenge.optionalChallenge,
    });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({
      message: 'You are Restricted Contact Support to Update Documents',
      challenge: challenge.challenge,
      optionalchallenge: challenge.optionalChallenge,
    });
  }
});

const getUrl = catchAsync(async (req, res) => {
  const Documenttype = req.params.doctype;
  const Authdata = await authService.getAuthById(req.SubjectId);
  const Url = await documentService.signedUrl(Authdata, Documenttype);
  if (Url !== false) {
    res.status(httpStatus.OK).json({ documentUrl: Url });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Sorry, Document Error' });
  }
});
const updateEsign = catchAsync(async (req, res) => {
  const esignlocation = req.files.esign[0].location;
  const auth = req.SubjectId;
  const result = await documentService.updateEsign(req.files.esign[0], auth);
  if (result === true) {
    res.status(httpStatus.OK).json({ message: 'Esign updated ', esignlocation });
  } else {
    res.status(httpStatus.BAD_GATEWAY).json({ message: 'cannot upload Esign' });
  }
});
module.exports = {
  upload,
  getUrl,
  updateEsign,
};
