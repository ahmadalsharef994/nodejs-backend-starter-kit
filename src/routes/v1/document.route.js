const express = require('express');
const { documentController } = require('../../controllers');
const authdoctornonverified = require('../../middlewares/authDoctorNonVerified');
const authdoctorVerified = require('../../middlewares/authDoctorVerified');
const { fileUpload } = require('../../Microservices');
const validate = require('../../middlewares/validate');
const documentValidation = require('../../validations/document.validation');

const router = express.Router();

router.post(
  '/upload',
  authdoctornonverified(),
  fileUpload.upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'esign', maxCount: 1 },
    { name: 'medicalDegree', maxCount: 1 },
    { name: 'medicalRegistration', maxCount: 1 },
    { name: 'aadharCardDoc', maxCount: 1 },
    { name: 'pancardDoc', maxCount: 1 },
    { name: 'ifsc', maxCount: 1 },
  ]),
  function (req, res) {
    documentController.upload(req, res);
  }
);

router.get('/view/:doctype', validate(documentValidation.documentUrl), authdoctornonverified(), function (req, res) {
  documentController.getUrl(req, res);
});
router.post(
  '/update-esign',
  authdoctorVerified(),
  fileUpload.upload.fields([{ name: 'esign', maxCount: 1 }]),
  documentController.updateEsign
);
module.exports = router;
