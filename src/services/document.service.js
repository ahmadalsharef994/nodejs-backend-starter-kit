/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-expressions */
const httpStatus = require('http-status');
const { Document } = require('../models');
// const fileUpload = require('../Microservices/fileUpload.service');
const ApiError = require('../utils/ApiError');

const Upload = async (resume, esign, ifsc, medicalDegree, medicalRegistration, aadharCardDoc, pancardDoc, auth) => {
  const DocDataExist = await Document.findOne({ auth });
  if (!DocDataExist) {
    // If doctor uploaded docx already exists
    const uploadDoc = await Document.create({
      resume,
      esign,
      ifsc,
      medicalDegree,
      medicalRegistration,
      aadharCardDoc,
      pancardDoc,
      auth,
    });
    return uploadDoc;
  }
  if (DocDataExist.isRestricted) {
    return false;
  }

  const updateFields = {
    resume,
    esign,
    ifsc,
    medicalDegree,
    medicalRegistration,
    aadharCardDoc,
    pancardDoc,
  };

  // Check if any field already has a value
  // eslint-disable-next-line no-restricted-syntax
  for (const field in updateFields) {
    if (DocDataExist[field] != null && updateFields[field] != null) {
      // throw new Error(`Error updating ${field}: field already has a value`);
    }
  }

  // Update fields if no errors occurred
  const updatedDoc = await Document.findOneAndUpdate(
    { _id: DocDataExist._id },
    { $set: updateFields },
    { new: true } // Return the updated document instead of the original document
  );
  return updatedDoc;
};

// const signedUrl = async (Authdata, document) => {
//   const DocDataExist = await Document.findOne({ auth: Authdata });
//   let docUrl = '';
//   switch (document) {
//     case 'resume':
//       docUrl = await fileUpload.getSignedUrl(DocDataExist.resume);
//       break;
//     case 'esign':
//       docUrl = await fileUpload.getSignedUrl(DocDataExist.esign);
//       break;
//     case 'medicalDegree':
//       docUrl = await fileUpload.getSignedUrl(DocDataExist.medicalDegree);
//       break;
//     case 'medicalRegistration':
//       docUrl = await fileUpload.getSignedUrl(DocDataExist.medicalRegistration);
//       break;
//     case 'aadharCardDoc':
//       docUrl = await fileUpload.getSignedUrl(DocDataExist.aadharCardDoc);
//       break;
//     case 'pancardDoc':
//       docUrl = await fileUpload.getSignedUrl(DocDataExist.pancardDoc);
//       break;
//     case 'ifsc':
//       docUrl = await fileUpload.getSignedUrl(DocDataExist.ifsc);
//       break;
//     default:
//       docUrl = 'Document not Found';
//   }
//   return docUrl;
// };

const getDocumentUrl = async (Authdata, document) => {
  const DocDataExist = await Document.findOne({ auth: Authdata });
  let documentUrl = '';
  switch (document) {
    case 'resume':
      documentUrl = DocDataExist.resume;
      break;
    case 'esign':
      documentUrl = DocDataExist.esign;
      break;
    case 'medicalDegree':
      documentUrl = DocDataExist.medicalDegree;
      break;
    case 'medicalRegistration':
      documentUrl = DocDataExist.medicalRegistration;
      break;
    case 'aadharCardDoc':
      documentUrl = DocDataExist.aadharCardDoc;
      break;
    case 'pancardDoc':
      documentUrl = DocDataExist.pancardDoc;
      break;
    case 'ifsc':
      documentUrl = DocDataExist.ifsc;
      break;
    default:
      documentUrl = false;
  }
  return documentUrl;
};
const fetchDocumentdata = async (AuthData) => {
  const DocDataExist = await Document.findOne({ auth: AuthData });
  return DocDataExist;
};
const updateEsign = async (esignlocation, Auth) => {
  await Document.updateOne({ auth: Auth }, { $set: { esign: esignlocation } });
  const { esign } = await Document.findOne({ auth: Auth });
  if (esign === undefined) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'ID not found please contact support ');
  }
  if (esign === esignlocation) {
    return true;
  }
  return false;
};

module.exports = {
  Upload,
  // signedUrl,
  fetchDocumentdata,
  updateEsign,
  getDocumentUrl,
};
