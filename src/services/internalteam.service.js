const { BAD_REQUEST } = require('http-status');
const httpStatus = require('http-status');
const { VerifiedDoctors } = require('../models');
const ApiError = require('../utils/ApiError');

const createVerifiedDoctor = async(docId, AuthData) => {
    const alreayExist = await checkVerification(AuthData);
    if(!alreayExist){
        const doctorverifieddata = await VerifiedDoctors.create({ verifiedby : AuthData._id, docid : docId });
        return doctorverifieddata;
    }else{
        throw new ApiError(BAD_REQUEST,"Data Already Submitted");
    }
}

const checkVerification = async(AuthData) => {
    const VerificationExist = await VerifiedDoctors.findOne({ docid: AuthData._id });
    return VerificationExist;
}

module.exports = {
    createVerifiedDoctor,
    checkVerification,
};
