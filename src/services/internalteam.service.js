const httpStatus = require('http-status');
/* const axios = require('axios'); */
const {
  DoctorRejection,
  doctordetails,
  Auth,
  DoctorBasic,
  VerifiedDoctors,
  DoctorClinic,
  DoctorEducation,
  DoctorExperience,
  Document,
} = require('../models');
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
  const rejected = await DoctorRejection.findOne({ doctorAuthId: docId });
  if (rejected) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This doctor was already in our rejected list');
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

const unverifiedDoctors = async () => {
  const doctorslist = await Auth.find(
    { role: { $in: ['doctor'] } },
    { _id: 1, fullname: 1, isEmailVerified: 1, isMobileVerified: 1, isbanned: 1 }
  );
  const verified = await VerifiedDoctors.find({}, { doctorauthid: 1 });
  const unverified = await DoctorRejection.find({}, { doctorAuthId: 1 });
  const verfieddoctors = [];
  verified.forEach((item) => {
    verfieddoctors.push(`${item.doctorauthid}`);
  });
  const unverfieddoctors = [];
  unverified.forEach((item) => {
    unverfieddoctors.push(`${item.doctorAuthId}`);
  });
  // eslint-disable-next-line array-callback-return
  const result = doctorslist.filter((item) => {
    if (!verfieddoctors.includes(`${item._id}`) && !unverfieddoctors.includes(`${item._id}`)) {
      return item;
    }
  });
  return result;
};

const fetchDoctorProfile = async (id) => {
  let basicDetails = await DoctorBasic.find({ auth: `${id}` });
  let educationDetails = await DoctorEducation.find({ auth: `${id}` });
  let clinicDetails = await DoctorClinic.find({ auth: `${id}` });
  let experienceDetails = await DoctorExperience.find({ auth: `${id}` });
  let documentDetails = await Document.findOne({ auth: `${id}` });
  let { fullname } = await Auth.findById(`${id}`);
  // eslint-disable-next-line no-console
  console.log(fullname);
  if (!fullname) {
    fullname = 'NOT FOUND';
  }
  if (basicDetails.length === 0) {
    basicDetails = 'NOT FOUND';
  }
  if (educationDetails === null || educationDetails === undefined || educationDetails.length === 0) {
    educationDetails = 'NOT FOUND';
  } else {
    basicDetails = basicDetails[0];
  }
  if (clinicDetails === null || clinicDetails === undefined || clinicDetails.length === 0) {
    clinicDetails = 'NOT FOUND';
  } else {
    clinicDetails = clinicDetails[0];
  }
  if (experienceDetails === null || experienceDetails === undefined || experienceDetails.length === 0) {
    experienceDetails = 'NOT FOUND';
  } else {
    experienceDetails = experienceDetails[0];
  }
  if (documentDetails === null || documentDetails === undefined || documentDetails.length === 0) {
    documentDetails = 'NOT FOUND';
  } else {
    educationDetails = educationDetails[0];
  }

  const res = { fullname, basicDetails, educationDetails, clinicDetails, experienceDetails, documentDetails };
  return res;
};

const verfieddoctors = async () => {
  const verifiedDoctors = await VerifiedDoctors.find();
  return verifiedDoctors;
};
const RejectedDoctors = async () => {
  const rejecedDoctors = await DoctorRejection.find();
  return rejecedDoctors;
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
  unverifiedDoctors,
  fetchDoctorProfile,
  verfieddoctors,
  RejectedDoctors,
};
