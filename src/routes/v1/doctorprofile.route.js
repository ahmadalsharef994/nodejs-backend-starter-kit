const express = require('express');
const validate = require('../../middlewares/validate');
const { profilePhotoUpload } = require('../../Microservices');
const DoctorProfileValidator = require('../../validations/DoctorProfile.validation');
const DoctorProfileController = require('../../controllers/doctorprofile.controller');
const authdoctornonverified = require('../../middlewares/authDoctorNonVerified');
const authdoctorverified = require('../../middlewares/authDoctorVerified');
const appointmentPreferenceController = require('../../controllers/appointmentpreference.controller');
const preferenceValidator = require('../../validations/appointmentpreference.validation');

const router = express.Router();

router.route('/stats').get(authdoctorverified(), DoctorProfileController.fetchstastics);
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
      const location = req.files.avatar[0].location;
      res.status(201).json({ message: 'Profile picture Updated!', location });
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

router.route('/getfollowups').get(authdoctorverified(), appointmentPreferenceController.showfollowups);
router
  .route('/updatePref')
  .put(
    authdoctorverified(),
    validate(preferenceValidator.preferenceDetails),
    appointmentPreferenceController.updateAppointmentPreference
  );
router
  .route('/createPref')
  .post(
    authdoctorverified(),
    validate(preferenceValidator.preferenceDetails),
    appointmentPreferenceController.submitAppointmentPreference
  );
router
  .route('/getappointment')
  .post(validate(preferenceValidator.getAppointmentSlots), appointmentPreferenceController.showappointments);
router.route('/payout-details').get(authdoctornonverified(), DoctorProfileController.fetchpayoutsdetails);
router
  .route('/payout-details')
  .post(
    authdoctornonverified(),
    validate(DoctorProfileValidator.PayoutsDoctorDetails),
    DoctorProfileController.submitpayoutsdetails
  );

router.route('/').get(authdoctorverified(), DoctorProfileController.fetchprofiledetails);

module.exports = router;
