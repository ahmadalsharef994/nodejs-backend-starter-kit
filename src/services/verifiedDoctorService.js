const httpStatus = require('http-status');
const { VerifiedDoctors } = require('../models');
const ApiError = require('../utils/ApiError');
const docuniqueidgenerator = require('../utils/generateDoctorID');

const checkVerification = async (doctorauthid) => {
  const VerificationExist = await VerifiedDoctors.findOne({ doctorauthid });
  return VerificationExist;
};

const createVerifiedDoctor = async (doctorauthid, AuthData) => {
  let uniqueID = docuniqueidgenerator();
  // eslint-disable-next-line no-await-in-loop
  while (await VerifiedDoctors.findOne({ docid: uniqueID })) {
    uniqueID = docuniqueidgenerator();
  }
  const alreayExist = await checkVerification(doctorauthid);
  if (!alreayExist) {
    const doctorverifieddata = await VerifiedDoctors.create({
      docid: uniqueID,
      verifiedby: AuthData._id,
      doctorauthid,
    });
    return doctorverifieddata;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Data Already Submitted');
};

module.exports = {
  createVerifiedDoctor,
  checkVerification,
};
