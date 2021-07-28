const { BAD_REQUEST } = require('http-status');
const httpStatus = require('http-status');
const { VerifiedDoctors } = require('../models');
const ApiError = require('../utils/ApiError');
const docuniqueidgenerator = require('../utils/generateDoctorID')


const createVerifiedDoctor = async(docId, AuthData) => {
    var uniqueID = docuniqueidgenerator();
    while (await VerifiedDoctors.findOne({ verifieddocid: uniqueID })){
        var uniqueID = docuniqueidgenerator();
    };
    const alreayExist = await checkVerification(docId);
    if(!alreayExist){
        const doctorverifieddata = await VerifiedDoctors.create({ verifieddocid: uniqueID, verifiedby : AuthData._id, docid : docId });
        return doctorverifieddata;
    }else{
        throw new ApiError(BAD_REQUEST,"Data Already Submitted");
    }
}

const checkVerification = async(docid) => {
    const VerificationExist = await VerifiedDoctors.findOne({ docid: docid });
    return VerificationExist;
}

module.exports = {
    createVerifiedDoctor,
    checkVerification,
};
