const httpStatus = require('http-status');
/* const axios = require('axios'); */
const { DoctorRejection, doctordetails } = require('../models');
const { verifiedDoctorService, authService } = require('.');
const ApiError = require('../utils/ApiError');

const acceptDoctorVerification = async (docId, AuthData) => {
  const doctorVerifiedData = await verifiedDoctorService.createVerifiedDoctor(docId, AuthData._id);
  return doctorVerifiedData;
};

const rejectDoctorVerification = async (
  docId,
  AuthData,
  basicDetails,
  educationDetails,
  experienceDetails,
  payoutDetails,
  rejectionMsg
) => {
  const isExist = await authService.getAuthById(docId);
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Doctor found with given docid, Rejection Unsuccessful!');
  }

  const isVerified = await verifiedDoctorService.checkVerification(docId);
  if (isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Doctor is Already Verified, Rejection Unsuccessful!');
  }

  const rejectedVerification = await DoctorRejection.create({
    doctorAuthId: docId,
    rejectedBy: AuthData,
    basicDetails,
    educationDetails,
    experienceDetails,
    payoutDetails,
    rejectionMsg,
  });
  return rejectedVerification;
};

const addDoctorDetails = async (
  doctorName,
  doctorauth,
  experience,
  Specialaizations,
  doctordegree,
  doctorClincaddress,
  appointmentprice,
  doctorid,
  adminauth
) => {
  const Doctordetails = await doctordetails.insertMany({
    specializations: Specialaizations,
    doctorname: doctorName,
    doctorauthId: doctorauth,
    Experience: experience,
    doctorDegree: doctordegree,
    doctorClinicAddress: doctorClincaddress,
    appointmentPrice: appointmentprice,
    doctorId: doctorid,
    Adminauth: adminauth,
  });
  return Doctordetails;
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
  acceptDoctorVerification,
  rejectDoctorVerification,
  // AutoverifyDoctorByBNMC,
  addDoctorDetails,
};
