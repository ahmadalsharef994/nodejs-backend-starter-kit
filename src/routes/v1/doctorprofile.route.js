const express = require('express');
const validate = require('../../middlewares/validate');
const doctorProfileValidator = require('../../validations/DoctorProfile.validation');
const doctorProfileController = require('../../controllers/doctorprofile.controller');
const authdoctornonverified = require('../../middlewares/authDoctorNonVerified');
const authdoctorverified = require('../../middlewares/authDoctorVerified');
const appointmentPreferenceController = require('../../controllers/appointmentpreference.controller');
const appointmentPreferenceValidator = require('../../validations/appointmentpreference.validation');
const profilePhotoUpload = require('../../Microservices/profilePicture.service');

const router = express.Router();

router.route('/stats').get(authdoctorverified(), doctorProfileController.getStats); // doctorProfileController, getStats
router.route('/basic-details').get(authdoctornonverified(), doctorProfileController.fetchbasicdetails); // getBasicDetails

router.route('/basic-details').post(
  authdoctornonverified(),
  // doctorBasicDetails
  validate(doctorProfileValidator.BasicDoctorDetails),
  doctorProfileController.submitbasicdetails
); // postBasicDetails

router
  .route('/basic-details/profile-picture')
  .post(
    profilePhotoUpload.uploadPhoto.fields([{ name: 'avatar', maxCount: 1 }]),
    authdoctornonverified(),
    function (req, res) {
      doctorProfileController.submitprofilepicture(req);
      const location = req.files.avatar[0].location;
      res.status(201).json({ message: 'Profile picture Updated!', location });
    }
  );

router.route('/education-details').get(authdoctornonverified(), doctorProfileController.fetcheducationdetails);
router
  .route('/education-details')
  .post(
    authdoctornonverified(),
    validate(doctorProfileValidator.EducationDoctorDetails),
    doctorProfileController.submiteducationdetails
  );

router.route('/experience-details').get(authdoctornonverified(), doctorProfileController.fetchexperiencedetails);
router
  .route('/experience-details')
  .post(
    authdoctornonverified(),
    validate(doctorProfileValidator.ExperienceDoctorDetails),
    doctorProfileController.submitexperiencedetails
  );

router.route('/clinic-details').get(authdoctornonverified(), doctorProfileController.fetchclinicdetails);
router
  .route('/clinic-details')
  .post(
    authdoctornonverified(),
    validate(doctorProfileValidator.ClinicDoctorDetails),
    doctorProfileController.submitclinicdetails
  );
router
  .route('/updatePref')
  .put(
    authdoctorverified(),
    validate(appointmentPreferenceValidator.preferenceDetails),
    appointmentPreferenceController.updateAppointmentPreference
  );

/* currently not being in use */
/* router.route('/createPref').post(authdoctorverified(),validate(preferenceValidator.preferenceDetails),appointmentPreferenceController.submitAppointmentPreference); */

// get all appointment preference slots
router.route('/getappointments').get(authdoctorverified(), appointmentPreferenceController.getAppointmentPreferences);

// get all followup preference slots
// router.route('/getfollowups').get(authdoctorverified(), appointmentPreferenceController.showFollowups);

router.route('/payout-details').get(authdoctornonverified(), doctorProfileController.fetchpayoutsdetails);
router
  .route('/payout-details')
  .post(
    authdoctornonverified(),
    validate(doctorProfileValidator.PayoutsDoctorDetails),
    doctorProfileController.submitpayoutsdetails
  );
router.post(
  '/consultationfee',
  authdoctorverified(),
  validate(doctorProfileValidator.addConsultationfee),
  doctorProfileController.addConsultationfee
);
router.post(
  '/notifications',
  authdoctorverified(),
  validate(doctorProfileValidator.notifications),
  doctorProfileController.notifications
);
router
  .route('/submit-education-and-experience')
  .post(
    authdoctornonverified(),
    validate(doctorProfileValidator.EducationExperience),
    doctorProfileController.doctorExpandEducation
  );
router
  .route('/update-clinic-timings')
  .post(authdoctorverified(), validate(doctorProfileValidator.timings), doctorProfileController.updateClinicDetails);
router
  .route('/update-details')
  .post(authdoctornonverified(), validate(doctorProfileValidator.updateDetails), doctorProfileController.updateDetails);
router
  .route('/update-appointmentPrice')
  .post(
    authdoctornonverified(),
    validate(doctorProfileValidator.updateAppointmentPrice),
    doctorProfileController.updateAppointmentPrice
  );
router.route('/get-doctor-clinictimings').get(authdoctornonverified(), doctorProfileController.getDoctorClinicTimings);

router.route('/').get(authdoctorverified(), doctorProfileController.fetchprofiledetails); // ISE

router
  .route('/send-quries')
  .post(authdoctorverified(), validate(doctorProfileValidator.doctorQueries), doctorProfileController.sendDoctorQueries);

router.route('/billing').get(authdoctornonverified(), doctorProfileController.getBillingDetails);

router
  .route('/send-queries')
  .post(authdoctorverified(), validate(doctorProfileValidator.doctorQueries), doctorProfileController.sendDoctorQueries);

router.route('/get-doctor-queries').get(authdoctorverified(), doctorProfileController.getDoctorQueries);

module.exports = router;
