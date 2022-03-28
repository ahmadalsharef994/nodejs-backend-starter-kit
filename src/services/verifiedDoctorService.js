const httpStatus = require('http-status');
const { VerifiedDoctors, DoctorBasic, DoctorEducation, doctordetails, Auth } = require('../models');
const ApiError = require('../utils/ApiError');
const docuniqueidgenerator = require('../utils/generateDoctorID');
const { authService } = require('.');

const checkVerification = async (authid) => {
  const VerificationExist = await VerifiedDoctors.findOne({ doctorauthid: authid });
  return VerificationExist;
};

const createVerifiedDoctor = async (doctorauthid, AuthData) => {
  const authExist = await authService.getAuthById(doctorauthid);
  if (!authExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Doctor found with given docAuthId, Verification Unsuccessful!');
  }

  const isVerified = await checkVerification(doctorauthid);
  if (isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Doctor Already Verified');
  }

  const Doctorbasic = await DoctorBasic.findOne({ auth: doctorauthid });
  const Doctoreducation = await DoctorEducation.findOne({ auth: doctorauthid });
  if (!Doctorbasic) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Basic details were not submitted for this id');
  }

  if (!Doctoreducation) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Education details were not submitted for this id');
  }

  let uniqueID = docuniqueidgenerator();
  // eslint-disable-next-line no-await-in-loop
  while (await VerifiedDoctors.findOne({ docid: uniqueID })) {
    uniqueID = docuniqueidgenerator();
  }
  const doctorverifieddata = await VerifiedDoctors.create({ docid: uniqueID, verifiedby: AuthData._id, doctorauthid });

  await DoctorBasic.updateOne({ auth: doctorauthid }, { $set: { isBasicDetailsVerified: true } });
  await DoctorEducation.updateOne({ auth: doctorauthid }, { $set: { isEducationVerified: true } });
  // await DoctorExperience.updateOne({ auth: doctorauthid }, { $set: { isExperienceVerified: true } });

  const { appointmentPrice } = await DoctorBasic.findOne({ auth: doctorauthid });
  const { fullname } = await Auth.findById(doctorauthid);
  // const { AddressSecondline } = await DoctorClinic.findOne({ auth: doctorauthid });
  // const { experience, skills, mainstream } = await DoctorExperience.findOne({ auth: doctorauthid });
  doctordetails.create({
    name: fullname,
    specializations: ['N/A'],
    doctorauthId: doctorauthid,
    Experience: 0,
    doctorDegree: 'Null',
    doctorClinicAddress: 'Null',
    appointmentPrice,
    doctorId: uniqueID,
    Adminauth: AuthData._id,
  });
  return doctorverifieddata;
};

module.exports = {
  createVerifiedDoctor,
  checkVerification,
};
