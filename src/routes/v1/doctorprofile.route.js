const express = require('express');
const validate = require('../../middlewares/validate');
const { profilePhotoUpload } = require('../../Microservices');
const DoctorProfileValidator = require('../../validations/DoctorProfile.validation');
const DoctorProfileController = require('../../controllers/doctorprofile.controller');
const authdoctornonverified = require('../../middlewares/authDoctorNonVerified');

const router = express.Router();

router.route('/basic-details').get(authdoctornonverified(), DoctorProfileController.fetchbasicdetails);
router
  .route('/basic-details')
  .post(
    authdoctornonverified(),
    validate(DoctorProfileValidator.BasicDoctorDetails),
    DoctorProfileController.submitbasicdetails
  );

router
  .route('/basic-details/profile-picture')
  .post(
    profilePhotoUpload.publicupload.fields([{ name: 'avatar', maxCount: 1 }]),
    authdoctornonverified(),
    function (req, res) {
      DoctorProfileController.submitprofilepicture(req);
      res.status(201).json('Profile picture Updated!');
    }
  );

router
  .route('/basic-details/update-profile-picture')
  .post(
    profilePhotoUpload.publicupload.fields([{ name: 'avatar', maxCount: 1 }]),
    authdoctornonverified(),
    function (req, res) {
      DoctorProfileController.submitprofilepicture(req);
      res.status(201).json('Profile picture Updated!');
    }
  );

router.route('/education-details').get(authdoctornonverified(), DoctorProfileController.fetcheducationdetails);
router
  .route('/education-details')
  .post(
    authdoctornonverified(),
    validate(DoctorProfileValidator.EducationDoctorDetails),
    DoctorProfileController.submiteducationdetails
  );

router.route('/experience-details').get(authdoctornonverified(), DoctorProfileController.fetchexperiencedetails);
router
  .route('/experience-details')
  .post(
    authdoctornonverified(),
    validate(DoctorProfileValidator.ExperienceDoctorDetails),
    DoctorProfileController.submitexperiencedetails
  );

router.route('/clinic-details').get(authdoctornonverified(), DoctorProfileController.fetchclinicdetails);
router
  .route('/clinic-details')
  .post(
    authdoctornonverified(),
    validate(DoctorProfileValidator.ClinicDoctorDetails),
    DoctorProfileController.submitclinicdetails
  );

module.exports = router;
