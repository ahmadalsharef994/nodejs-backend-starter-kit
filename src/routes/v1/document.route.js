const express = require('express');
const { documentController } = require('../../controllers');
const authdoctornonverified = require('../../middlewares/authDoctorNonVerified');
const { fileUpload } = require('../../Microservices');

const router = express.Router();
router.post('/upload', authdoctornonverified(), fileUpload.upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'esign', maxCount: 1 },
    { name: 'medicalDegree', maxCount: 1 },
    { name: 'medicalRegistration', maxCount: 1 },
    { name: 'aadharCardDoc', maxCount: 1 },
    { name: 'pancardDoc', maxCount: 1 },
    { name: 'ifsc', maxCount: 1 },
  ]),function (req, res) {
    documentController.upload(req, res);
  });


module.exports = router;
