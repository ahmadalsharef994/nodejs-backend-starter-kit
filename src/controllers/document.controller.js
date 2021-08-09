const { authService, documentService } = require('../services');

const upload = async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const resume = req.files.resume[0].key;
  const esign = req.files.esign[0].key;
  const ifsc = req.files.ifsc[0].key;
  const medicalDegree = req.files.medicalDegree[0].key;
  const medicalRegistration = req.files.medicalRegistration[0].key;
  const aadharCardDoc = req.files.aadharCardDoc[0].key;
  const pancardDoc = req.files.pancardDoc[0].key;
  await documentService.Upload(resume, esign, ifsc, medicalDegree, medicalRegistration, aadharCardDoc, pancardDoc, AuthData);
  res.status(200).json('Documents Uploaded');
};

module.exports = {
  upload,
};
