const httpStatus = require('http-status');
const { VerifiedDoctors } = require('../models');
const ApiError = require('../utils/ApiError');
const docuniqueidgenerator = require('../utils/generateDoctorID');
const { authService } = require('.');

const checkVerification = async (doctorauthid) => {
  const VerificationExist = await VerifiedDoctors.findOne({ doctorauthid });
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

  let uniqueID = docuniqueidgenerator();
  // eslint-disable-next-line no-await-in-loop
  while (await VerifiedDoctors.findOne({ docid: uniqueID })) {
    uniqueID = docuniqueidgenerator();
  }

  const doctorverifieddata = await VerifiedDoctors.create({ docid: uniqueID, verifiedby: AuthData._id, doctorauthid });
  return doctorverifieddata;
};

module.exports = {
  createVerifiedDoctor,
  checkVerification,
};
