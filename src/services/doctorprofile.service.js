const httpStatus = require('http-status');
const { DoctorBasic, DoctorEducation, DoctorClinic, DoctorExperience } = require('../models');
const ApiError = require('../utils/ApiError');

const fetchbasicdetails = async (AuthData) => {
  const DoctorBasicExist = await DoctorBasic.findOne({ auth: AuthData });
  return DoctorBasicExist;
};

const submitbasicdetails = async (BasicDetailBody, AuthData) => {
  const alreadyExist = await fetchbasicdetails(AuthData);
  if (!alreadyExist) {
    // eslint-disable-next-line no-param-reassign
    BasicDetailBody.auth = AuthData; // Assign Reference to Req Body
    const basicDetailDoc = await DoctorBasic.create(BasicDetailBody);
    return basicDetailDoc;
  }
  return false;
};

const submitprofilepicture = async (ProfilePhoto, AuthData) => {
  const alreadyExist = await fetchbasicdetails(AuthData);
  if (alreadyExist) {
    await DoctorBasic.updateOne({ _id: alreadyExist._id }, { $set: { avatar: ProfilePhoto } });
    return 'profile Picture updated';
  }
};

const fetcheducationdetails = async (AuthData) => {
  const DoctorEducationExist = await DoctorEducation.findOne({ auth: AuthData });
  return DoctorEducationExist;
};

const submiteducationdetails = async (EducationDetailBody, AuthData) => {
  const alreayExist = await fetcheducationdetails(AuthData);
  if (!alreayExist) {
    // eslint-disable-next-line no-param-reassign
    EducationDetailBody.auth = AuthData; // Assign Reference to Req Body
    const educationDetailDoc = await DoctorEducation.create(EducationDetailBody);
    return educationDetailDoc;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Data Already Submitted');
};

const fetchClinicdetails = async (AuthData) => {
  const DoctorClinicExist = await DoctorClinic.findOne({ auth: AuthData });
  return DoctorClinicExist;
};

const submitedClinicdetails = async (ClinicDetailBody, AuthData) => {
  const alreayExist = await fetchClinicdetails(AuthData);
  if (!alreayExist) {
    // eslint-disable-next-line no-param-reassign
    ClinicDetailBody.auth = AuthData; // Assign Reference to Req Body
    const clinicDetailDoc = await DoctorClinic.create(ClinicDetailBody);
    return clinicDetailDoc;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Data Already Submitted');
};

const fetchexperiencedetails = async (AuthData) => {
  const DoctorExperienceExist = await DoctorExperience.findOne({ auth: AuthData });
  return DoctorExperienceExist;
};

const submitexperiencedetails = async (ExperienceDetailBody, AuthData) => {
  const alreayExist = await fetchexperiencedetails(AuthData);
  if (!alreayExist) {
    // eslint-disable-next-line no-param-reassign
    ExperienceDetailBody.auth = AuthData; // Assign Reference to Req Body
    const ExperienceDetailDoc = await DoctorExperience.create(ExperienceDetailBody);
    return ExperienceDetailDoc;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Data Already Submitted');
};

module.exports = {
  submitbasicdetails,
  fetchbasicdetails,
  submiteducationdetails,
  fetcheducationdetails,
  submitedClinicdetails,
  fetchClinicdetails,
  submitprofilepicture,
  submitexperiencedetails,
  fetchexperiencedetails,
};
