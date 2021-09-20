const { BAD_REQUEST } = require('http-status');
const httpStatus = require('http-status');
const { VerifiedDoctors } = require('../models');
const ApiError = require('../utils/ApiError');
const docuniqueidgenerator = require('../utils/generateDoctorID');

const createVerifiedDoctor = async (doctorauthid, AuthData) => {
  var uniqueID = docuniqueidgenerator();
  while (await VerifiedDoctors.findOne({ docid: uniqueID })) {
    var uniqueID = docuniqueidgenerator();
  }
  const alreayExist = await checkVerification(doctorauthid);
  if (!alreayExist) {
    const doctorverifieddata = await VerifiedDoctors.create({
      docid: uniqueID,
      verifiedby: AuthData._id,
      doctorauthid: doctorauthid,
    });
    return doctorverifieddata;
  }
  throw new ApiError(BAD_REQUEST, 'Data Already Submitted');
};

const checkVerification = async (doctorauthid) => {
  const VerificationExist = await VerifiedDoctors.findOne({ doctorauthid });
  return VerificationExist;
};

module.exports = {
  createVerifiedDoctor,
  checkVerification,
};
