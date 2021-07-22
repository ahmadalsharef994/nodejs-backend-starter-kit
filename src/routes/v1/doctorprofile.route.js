const express = require('express');
const validate = require('../../middlewares/validate');
const DoctorProfileValidator = require('../../validations/DoctorProfile.validation');
const DoctorProfileController = require('../../controllers/doctorprofile.controller');
const authdoctornonverified = require('../../middlewares/authDoctorNonVerified');

const router = express.Router();

router.route('/basic-details').get(authdoctornonverified(), DoctorProfileController.fetchbasicdetails);
router.route('/basic-details').post(authdoctornonverified(), validate(DoctorProfileValidator.BasicDoctorDetails), DoctorProfileController.submitbasicdetails);

router.route('/education-details').get(authdoctornonverified(), DoctorProfileController.fetcheducationdetails);
router.route('/education-details').post(authdoctornonverified(), validate(DoctorProfileValidator.EducationDoctorDetails), DoctorProfileController.submiteducationdetails);
module.exports = router;