const httpStatus = require('http-status');
const { VerifiedDoctors } = require('../models');
const ApiError = require('../utils/ApiError');

const checkVerification = async (AuthData) => {
  const VerificationExist = await VerifiedDoctors.findOne({ docid: AuthData._id });
  return VerificationExist;
};

const createVerifiedDoctor = async (docId, AuthData) => {
  const alreayExist = await checkVerification(AuthData);
  if (!alreayExist) {
    const doctorverifieddata = await VerifiedDoctors.create({ verifiedby: AuthData._id, docid: docId });
    return doctorverifieddata;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Data Already Submitted');
};

module.exports = {
  createVerifiedDoctor,
  checkVerification,
};
