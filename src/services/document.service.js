/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-expressions */
const httpStatus = require('http-status');
const { Document } = require('../models');
const fileUpload = require('../Microservices/fileUpload.service');
const ApiError = require('../utils/ApiError');

const Upload = async (resume, esign, ifsc, medicalDegree, medicalRegistration, aadharCardDoc, pancardDoc, AuthData) => {
  const DocDataExist = await Document.findOne({ auth: AuthData._id });
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
      auth: AuthData,
    });
    return uploadDoc;
  }
  if (DocDataExist.isRestricted !== true) {
    // Check is Restricted
    const DataToUpdate = {};
    let throwError = false;
    resume != null ? (DocDataExist.resume != null ? (throwError = true) : (DataToUpdate.resume = resume)) : false;
    esign != null ? (DocDataExist.esign != null ? (throwError = true) : (DataToUpdate.esign = esign)) : false;
    ifsc != null ? (DocDataExist.ifsc != null ? (throwError = true) : (DataToUpdate.ifsc = ifsc)) : false;
    medicalDegree != null
      ? DocDataExist.medicalDegree != null
        ? (throwError = true)
        : (DataToUpdate.medicalDegree = medicalDegree)
      : false;
    medicalRegistration != null
      ? DocDataExist.medicalRegistration != null
        ? (throwError = true)
        : (DataToUpdate.medicalRegistration = medicalRegistration)
      : false;
    aadharCardDoc != null
      ? DocDataExist.aadharCardDoc != null
        ? (throwError = true)
        : (DataToUpdate.aadharCardDoc = aadharCardDoc)
      : false;
    pancardDoc != null
      ? DocDataExist.pancardDoc != null
        ? (throwError = true)
        : (DataToUpdate.pancardDoc = pancardDoc)
      : false;
    if (throwError === false && DataToUpdate !== {}) {
      const uploadDoc = await Document.updateOne({ _id: DocDataExist._id }, { $set: DataToUpdate });
      return uploadDoc;
    }
    return false;
  }
  return false;
};

const signedUrl = async (Authdata, document) => {
  const DocDataExist = await Document.findOne({ auth: Authdata });
  let docUrl = '';
  switch (document) {
    case 'resume':
      docUrl = await fileUpload.getSignedUrl(DocDataExist.resume);
      break;
    case 'esign':
      docUrl = await fileUpload.getSignedUrl(DocDataExist.esign);
      break;
    case 'medicalDegree':
      docUrl = await fileUpload.getSignedUrl(DocDataExist.medicalDegree);
      break;
    case 'medicalRegistration':
      docUrl = await fileUpload.getSignedUrl(DocDataExist.medicalRegistration);
      break;
    case 'aadharCardDoc':
      docUrl = await fileUpload.getSignedUrl(DocDataExist.aadharCardDoc);
      break;
    case 'pancardDoc':
      docUrl = await fileUpload.getSignedUrl(DocDataExist.pancardDoc);
      break;
    case 'ifsc':
      docUrl = await fileUpload.getSignedUrl(DocDataExist.ifsc);
      break;
    default:
      docUrl = 'Document not Found';
  }
  return docUrl;
};

const fetchDocumentdata = async (AuthData) => {
  const DocDataExist = await Document.findOne({ auth: AuthData });
  return DocDataExist;
};
const updateEsign = async (Esign, Auth) => {
  await Document.updateOne({ auth: Auth }, { $set: { esign: Esign.key } });
  const { esign } = await Document.findOne({ auth: Auth });
  if (esign === undefined) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'ID not found please contact support ');
  }
  if (esign === Esign.key) {
    return true;
  }
  return false;
};

module.exports = {
  Upload,
  signedUrl,
  fetchDocumentdata,
  updateEsign,
};
