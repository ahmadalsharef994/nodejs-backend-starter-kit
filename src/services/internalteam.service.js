const httpStatus = require('http-status');
/* const axios = require('axios'); */
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

/* async function getData(registrationNo) {
  try {
    let data = JSON.stringify({
      registrationNo: registrationNo,
    }); 
     let res = await axios({
          url: 'https://www.nmc.org.in/MCIRest/open/getDataFromService?service=searchDoctor',
          method: 'get',
          timeout: 8000,
          headers: {
              'Content-Type': 'application/json',
          },
          data: data,
      })
      if(res.status == 200){
          // test for status you want, etc
          console.log(res.status)
      }    
      // Don't forget to return something   
      return res.data
  }
  catch (err) {
      console.error(err);
  }
} */

/* const AutoverifyDoctorByBNMC = async (registrationNo, registrationState, yearofRegistration) => {
  const responsestatus = await getData(registrationNo);
  console.log(responsestatus);
}; */

module.exports = {
  createVerifiedDoctor,
  checkVerification,
  // AutoverifyDoctorByBNMC,
};
