const httpStatus = require('http-status');
const {
  VerifiedDoctors,
  DoctorBasic,
  // DoctorEducation,
  // doctordetails,
  // DoctorExperience,
  // DoctorClinic,
  // Auth,
} = require('../models');
const ApiError = require('../utils/ApiError');
const docuniqueidgenerator = require('../utils/generateDoctorID');
const { authService } = require('.');

const checkVerification = async (authid) => {
  const doctorBasic = await DoctorBasic.findOne({ doctorAuthId: authid });
  return true
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

  // const Doctorbasic = await DoctorBasic.findOne({ auth: doctorauthid });
  // const Doctoreducation = await DoctorEducation.findOne({ auth: doctorauthid });
  // const Doctorclinic = await DoctorClinic.findOne({ auth: doctorauthid });
  // const Doctorexp = await DoctorExperience.findOne({ auth: doctorauthid });
  // if (!Doctorbasic) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Basic details were not submitted for this id');
  // }
  // if (!Doctorclinic) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Clinic details were not submitted for this id');
  // }
  // if (!Doctorexp) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Experience details were not submitted for this id');
  // }

  // if (!Doctoreducation) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, 'Education details were not submitted for this id');
  // }

  const doctorBasic = await DoctorBasic.findOne({ auth: doctorauthid });

  doctorBasic.isDoctorVerified = true;

  const verifiedDoctorId = docuniqueidgenerator();
  doctorBasic.verifiedDoctorId = verifiedDoctorId;
  doctorBasic.isBasicDetailsVerified = true;
  doctorBasic.isEducationVerified = true;
  doctorBasic.isExperienceVerified = true;
  doctorBasic.verifiedBy = AuthData._id;
  await doctorBasic.save();

  return doctorBasic;

  // eslint-disable-next-line no-await-in-loop
  // while (await VerifiedDoctors.findOne({ docid: uniqueID })) {
  //   uniqueID = docuniqueidgenerator();
  // }
  // const doctorverifieddata = await VerifiedDoctors.create({ docid: uniqueID, verifiedby: AuthData._id, doctorauthid });

  // await DoctorBasic.updateOne({ auth: doctorauthid }, { $set: { isBasicDetailsVerified: true } });
  // await DoctorEducation.updateOne({ auth: doctorauthid }, { $set: { isEducationVerified: true } });
  // await DoctorExperience.updateOne({ auth: doctorauthid }, { $set: { isExperienceVerified: true } });

  // const { appointmentPrice, gender, languages } = await DoctorBasic.findOne({ auth: doctorauthid });
  // const { fullname } = await Auth.findById(doctorauthid);
  // const { AddressSecondline } = await DoctorClinic.findOne({ auth: doctorauthid });
  // const { experience, skills, mainstream } = await DoctorExperience.findOne({ auth: doctorauthid });
  // doctordetails.create({
  //   doctorname: fullname,
  //   specializations: skills,
  //   doctorauthId: doctorauthid,
  //   Experience: experience,
  //   doctorDegree: mainstream,
  //   doctorClinicAddress: AddressSecondline,
  //   appointmentPrice,
  //   doctorId: uniqueID,
  //   Adminauth: AuthData._id,
  //   Languages: languages,
  //   Gender: gender,
  // });
  // return doctorverifieddata;
};
const fetchdoctorId = async (doctorauthid) => {
  const { docid } = await VerifiedDoctors.findOne({ doctorauthid: `${doctorauthid}` });
  return docid;
};
module.exports = {
  createVerifiedDoctor,
  checkVerification,
  fetchdoctorId,
};
