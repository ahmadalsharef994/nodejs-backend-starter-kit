const httpStatus = require('http-status');
const profilePhotoUpload = require('../Microservices/profilePhotoUpload');
const {
  DoctorBasic,
  DoctorEducation,
  DoctorClinic,
  DoctorExperience,
  DoctorPayout,
  ConsultationFee,
  Notification,
} = require('../models');
const ApiError = require('../utils/ApiError');

const fetchbasicdetails = async (AuthData) => {
  const DoctorBasicExist = await DoctorBasic.findOne({ auth: AuthData });
  return DoctorBasicExist;
};

const submitbasicdetails = async (BasicDetailBody, AuthData) => {
  // eslint-disable-next-line no-param-reassign
  BasicDetailBody.auth = AuthData; // Assign Reference to Req Body
  const basicDetailDoc = await DoctorBasic.create(BasicDetailBody);
  return basicDetailDoc;
};

const submitprofilepicture = async (ProfilePhoto, AuthData) => {
  const alreadyExist = await fetchbasicdetails(AuthData);
  if (alreadyExist) {
    await DoctorBasic.updateOne({ _id: alreadyExist._id }, { $set: { avatar: ProfilePhoto } });
    return 'profile Picture updated';
  }
  return false;
};

const updateprofilepicture = async (ProfilePhoto, AuthData, returnThumbnail) => {
  const alreadyExist = await fetchbasicdetails(AuthData);
  if (alreadyExist) {
    const resultData = await DoctorBasic.findOne({ _id: alreadyExist._id });
    // need to rethink once s3 is working properly
    await profilePhotoUpload.deleteAvatar(resultData.avatar, resultData.thumbnail);
    await DoctorBasic.updateOne({ _id: alreadyExist._id }, { $set: { avatar: ProfilePhoto, thumbnail: returnThumbnail } });
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
  const DoctorClinicExist = await DoctorClinic.find({ auth: AuthData });
  return DoctorClinicExist;
};

const submitedClinicdetails = async (ClinicDetailBody, AuthData) => {
  // eslint-disable-next-line no-param-reassign
  ClinicDetailBody.auth = AuthData; // Assign Reference to Req Body
  const clinicDetailDoc = await DoctorClinic.create(ClinicDetailBody);
  return clinicDetailDoc;
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

const fetchpayoutsdetails = async (AuthData) => {
  const DoctorPayoutExist = await DoctorPayout.findOne({ auth: AuthData });
  return DoctorPayoutExist;
};

const submitpayoutsdetails = async (PayoutDetailBody, AuthData) => {
  const alreayExist = await fetchpayoutsdetails(AuthData);
  if (!alreayExist) {
    // eslint-disable-next-line no-param-reassign
    PayoutDetailBody.auth = AuthData; // Assign Reference to Req Body
    const PayoutDetailDoc = await DoctorPayout.create(PayoutDetailBody);
    return PayoutDetailDoc;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Data Already Submitted');
};

const addConsultationfee = async (consultationfeeDoc) => {
  const DoctorConsultationfee = await ConsultationFee.create(consultationfeeDoc);
  if (DoctorConsultationfee) {
    return { message: 'Consultation fee added Sucessfully', DoctorConsultationfee };
  }
  return false;
};

const notificationSettings = async (notifications, auth) => {
  const notificationDoc = await Notification.findOneAndUpdate(
    { auth },
    { $set: { ...notifications, auth } },
    { upsert: true, new: true }
  );
  if (notificationDoc) {
    return { message: 'Notification Options Updated!', notificationDoc };
  }
  return false;
};
const updteClinicDetails = async (Auth, timings, clinicId) => {
  const result = await DoctorClinic.find({ _id: clinicId, auth: Auth });
  if (typeof result[0] === 'object') {
    await DoctorClinic.updateOne({ _id: clinicId }, { $set: { timing: timings } });
    const res = await DoctorClinic.findById(clinicId);
    const response = { id: res._id, clinicName: res.clinicName };
    return response;
  }
  return false;
};
const updateDetails = async (about, address, pincode, experience, country, state, city, auth) => {
  const Auth = { auth };
  const About = { about, address, pincode, experience, country, state, city };
  try {
    await DoctorBasic.findOneAndUpdate(Auth, About);
    await DoctorExperience.updateOne({ auth }, { $set: { experience } });
    return true;
  } catch (error) {
    return error;
  }
};

const doctorExpEducation = async (auth, experience, education) => {
  // eslint-disable-next-line no-param-reassign
  education.auth = auth;
  // eslint-disable-next-line no-param-reassign
  experience.auth = auth;
  const edu = await DoctorEducation.findOne({ auth });
  const exp = await DoctorExperience.findOne({ auth });
  if (edu || exp) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'these details were already submitted ');
  } else {
    const Education = await DoctorEducation.create(education);
    const Experience = await DoctorExperience.create(experience);
    return { Education, Experience };
  }
};
const updateappointmentPrice = async (appointmentPrice, auth) => {
  await DoctorBasic.updateOne({ auth }, { $set: { appointmentPrice } });
  const result = await DoctorBasic.findOne({ appointmentPrice });
  if (result.appointmentPrice === appointmentPrice) {
    return true;
  }
  return false;
};
const doctorClinicTimings = async (auth) => {
  const result = await DoctorClinic.find({ auth });
  if (result) {
    return result;
  }
  return null;
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
  updateprofilepicture,
  fetchpayoutsdetails,
  submitpayoutsdetails,
  addConsultationfee,
  notificationSettings,
  updteClinicDetails,
  updateDetails,
  doctorExpEducation,
  updateappointmentPrice,
  doctorClinicTimings,
};
