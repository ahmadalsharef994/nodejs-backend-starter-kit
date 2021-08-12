const { Error } = require('mongoose');
const { authService, documentService } = require('../services');
const ApiError = require('../utils/ApiError');

const upload = async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  try{
    var resume = req.files.resume[0].key;
  }catch{
    var resume = null;
  }
  try{
    var esign = req.files.esign[0].key;
  }catch{
    var esign = null;
  }
  try{
    var ifsc = req.files.ifsc[0].key;
  }catch{
    var ifsc = null;
  }
  try{
    var medicalDegree = req.files.medicalDegree[0].key;
  }catch{
    var medicalDegree = null;
  }
  try{
    var medicalRegistration = req.files.medicalRegistration[0].key;
  }catch{
    var medicalRegistration = null;
  }
  try{
    var aadharCardDoc = req.files.aadharCardDoc[0].key;

  }catch{
    var aadharCardDoc = null;
  }
  try{
    var pancardDoc = req.files.pancardDoc[0].key;
  }catch{
    var pancardDoc = null;
  }
  const DataQuery = await documentService.Upload(resume, esign, ifsc, medicalDegree, medicalRegistration, aadharCardDoc, pancardDoc, AuthData);
  if(DataQuery != false){
    res.status(200).json('Documents Uploaded');
  }else{
    res.status(400).json("You are Restricted Contact Support to Update Documents");
  }
};

module.exports = {
  upload,
};
