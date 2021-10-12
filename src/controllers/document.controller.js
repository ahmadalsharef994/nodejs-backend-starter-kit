const { Error } = require('mongoose');
const httpStatus = require('http-status');
const { authService, documentService } = require('../services');
const authDoctorController = require('./authdoctor.controller');
const ApiError = require('../utils/ApiError');

const upload = async (req, res) => {
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
    res.status(httpStatus.OK).json({ message: 'Documents Uploaded', challenge });
  } else {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: 'You are Restricted Contact Support to Update Documents', challenge });
  }
};

const getUrl = async (req, res) => {
  const Documenttype = req.params.doctype;
  const Authdata = await authService.getAuthById(req.SubjectId);
  const Url = await documentService.signedUrl(Authdata, Documenttype);
  if (Url !== false) {
    res.status(httpStatus.OK).json({ documentUrl: Url });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Sorry, Document Error' });
  }
};

module.exports = {
  upload,
  getUrl,
};
