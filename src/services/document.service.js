const { Document, Auth } = require('../models');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

const Upload = async (resume, esign, ifsc, medicalDegree, medicalRegistration, aadharCardDoc, pancardDoc, AuthData) => {
    var DocDataExist = await Document.findOne({ auth: AuthData });
    if (!DocDataExist) { //If doctor uploaded docx already exists
      const uploadDoc = await Document.create({resume : resume, esign: esign, ifsc: ifsc, medicalDegree: medicalDegree, medicalRegistration: medicalRegistration, aadharCardDoc: aadharCardDoc, pancardDoc: pancardDoc, auth: AuthData});
      return uploadDoc;
    }else{
      if(DocDataExist.isRestricted != true){ //Check is Restricted
        const DataToUpdate = {};
        var throwError = false;
        resume != null ? (DocDataExist.resume != null ? throwError = true : (DataToUpdate.resume = resume)) : false;
        esign != null ? (DocDataExist.esign != null ? throwError = true : (DataToUpdate.esign = esign)) : false;
        ifsc != null ? (DocDataExist.ifsc != null ? throwError = true : (DataToUpdate.ifsc = ifsc)) : false;
        medicalDegree != null ? (DocDataExist.medicalDegree != null ? throwError = true : (DataToUpdate.medicalDegree = medicalDegree)) : false;
        medicalRegistration != null ? (DocDataExist.medicalRegistration != null ? throwError = true : (DataToUpdate.medicalRegistration = medicalRegistration)) : false;
        aadharCardDoc != null ? (DocDataExist.aadharCardDoc != null ? throwError = true : (DataToUpdate.aadharCardDoc = aadharCardDoc)) : false;
        pancardDoc != null ? (DocDataExist.pancardDoc != null ? throwError = true : (DataToUpdate.pancardDoc = pancardDoc)) : false;
        if(throwError == false && DataToUpdate != {}){
          const uploadDoc = await Document.updateOne({ _id: DocDataExist._id }, { $set: DataToUpdate });
          return uploadDoc;
        }else{
          return false;
        }
      }else{
        return false;
      }
    }  
}
module.exports = {
  Upload

};
