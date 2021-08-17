const { BAD_REQUEST } = require('http-status');
const httpStatus = require('http-status');
const { DoctorBasic, DoctorEducation } = require('../models');
const ApiError = require('../utils/ApiError');

const submitbasicdetails = async (BasicDetailBody, AuthData) => {
  const alreayExist = await fetchbasicdetails(AuthData);
  if (!alreayExist) {
    BasicDetailBody.auth = AuthData; // Assign Reference to Req Body
    const basicDetailDoc = await DoctorBasic.create(BasicDetailBody);
    return basicDetailDoc;
  }
  throw new ApiError(BAD_REQUEST, 'Data Already Submitted');
};

const fetchbasicdetails = async (AuthData) => {
  const DoctorBasicExist = await DoctorBasic.findOne({ auth: AuthData });
  return DoctorBasicExist;
};

const submiteducationdetails = async (EducationDetailBody, AuthData) => {
  const alreayExist = await fetcheducationdetails(AuthData);
  if (!alreayExist) {
    EducationDetailBody.auth = AuthData; // Assign Reference to Req Body
    const educationDetailDoc = await DoctorEducation.create(EducationDetailBody);
    return educationDetailDoc;
  }
  throw new ApiError(BAD_REQUEST, 'Data Already Submitted');
};

const fetcheducationdetails = async (AuthData) => {
  const DoctorEducationExist = await DoctorEducation.findOne({ auth: AuthData });
  return DoctorEducationExist;
};

module.exports = {
  submitbasicdetails,
  fetchbasicdetails,
  submiteducationdetails,
  fetcheducationdetails,
};
