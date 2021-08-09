const { Document } = require('../models');
const catchAsync = require('../utils/catchAsync');

const Upload = catchAsync(async (resume, esign, ifsc, medicalDegree, medicalRegistration, aadharCardDoc, pancardDoc, AuthData) => {
    const authDataExist = await Document.findOne({ auth: AuthData });
    if (!authDataExist) {
       const uploadDoc = await Document.create({ 
       resume,
       esign,
       ifsc,
       medicalDegree,
       medicalRegistration,
       aadharCardDoc,
       pancardDoc
      });
      return uploadDoc;
    }
  
  
})







module.exports = {
  Upload

};
