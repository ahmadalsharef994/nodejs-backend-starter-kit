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

/**
 * @openapi
 * /doctor/profile/stats:
 *  get:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router.route('/stats').get(authdoctorverified(), doctorProfileController.getStats); // doctorProfileController, getStats

/**
 * @openapi
 * /doctor/profile/basic-details:
 *  get:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router.route('/basic-details').get(authdoctornonverified(), doctorProfileController.fetchbasicdetails); // getBasicDetails

/**
 * @openapi
 * /doctor/profile/basic-details:
 *  post:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router.route('/basic-details').post(
  authdoctornonverified(),
  // doctorBasicDetails
  validate(doctorProfileValidator.BasicDoctorDetails),
  doctorProfileController.submitbasicdetails
); // postBasicDetails

/**
 * @openapi
 * /doctor/profile/basic-details/profile-picture:
 *  post:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
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

/**
 * @openapi
 * /doctor/profile/education-details:
 *  get:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router.route('/education-details').get(authdoctornonverified(), doctorProfileController.fetcheducationdetails);

/**
 * @openapi
 * /doctor/profile/education-details:
 *  post:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router
  .route('/education-details')
  .post(
    authdoctornonverified(),
    validate(doctorProfileValidator.EducationDoctorDetails),
    doctorProfileController.submiteducationdetails
  );

/**
 * @openapi
 * /doctor/profile/experience-details:
 *  get:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router.route('/experience-details').get(authdoctornonverified(), doctorProfileController.fetchexperiencedetails);

/**
 * @openapi
 * /doctor/profile/education-details:
 *  post:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router
  .route('/experience-details')
  .post(
    authdoctornonverified(),
    validate(doctorProfileValidator.ExperienceDoctorDetails),
    doctorProfileController.submitexperiencedetails
  );

/**
 * @openapi
 * /doctor/profile/clinic-details:
 *  get:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router.route('/clinic-details').get(authdoctornonverified(), doctorProfileController.fetchclinicdetails);

/**
 * @openapi
 * /doctor/profile/education-details:
 *  post:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router
  .route('/clinic-details')
  .post(
    authdoctornonverified(),
    validate(doctorProfileValidator.ClinicDoctorDetails),
    doctorProfileController.submitclinicdetails
  );

/**
 * @openapi
 * /doctor/profile/updatePref:
 *  put:
 *     tags:
 *     - doctor
 *     - doctor profile
 *     - DEPRICATED ENDPOINT
 */
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
/**
 * @openapi
 * /doctor/profile/getappointments:
 *  get:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router.route('/getappointments').get(authdoctorverified(), appointmentPreferenceController.showAppointments);

// get all followup preference slots
/**
 * @openapi
 * /doctor/profile/getfollowups:
 *  get:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router.route('/getfollowups').get(authdoctorverified(), appointmentPreferenceController.showFollowups);

/**
 * @openapi
 * /doctor/profile/payout-details:
 *  get:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router.route('/payout-details').get(authdoctornonverified(), doctorProfileController.fetchpayoutsdetails);

/**
 * @openapi
 * /doctor/profile/payout-details:
 *  post:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router
  .route('/payout-details')
  .post(
    authdoctornonverified(),
    validate(doctorProfileValidator.PayoutsDoctorDetails),
    doctorProfileController.submitpayoutsdetails
  );

/**
 * @openapi
 * /doctor/profile/consultationfee:
 *  post:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router.post(
  '/consultationfee',
  authdoctorverified(),
  validate(doctorProfileValidator.addConsultationfee),
  doctorProfileController.addConsultationfee
);

/**
 * @openapi
 * /doctor/profile/notifications:
 *  post:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router.post(
  '/notifications',
  authdoctorverified(),
  validate(doctorProfileValidator.notifications),
  doctorProfileController.notifications
);

/**
 * @openapi
 * /doctor/profile/submit-education-and-experience:
 *  post:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router
  .route('/submit-education-and-experience')
  .post(
    authdoctornonverified(),
    validate(doctorProfileValidator.EducationExperience),
    doctorProfileController.doctorExpandEducation
  );

/**
 * @openapi
 * /doctor/profile/update-clinic-timings:
 *  post:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router
  .route('/update-clinic-timings')
  .post(authdoctorverified(), validate(doctorProfileValidator.timings), doctorProfileController.updateClinicDetails);

/**
 * @openapi
 * /doctor/profile/update-details:
 *  post:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router
  .route('/update-details')
  .post(authdoctornonverified(), validate(doctorProfileValidator.updateDetails), doctorProfileController.updateDetails);

/**
 * @openapi
 * /doctor/profile/update-appointmentPrice:
 *  post:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router
  .route('/update-appointmentPrice')
  .post(
    authdoctornonverified(),
    validate(doctorProfileValidator.updateAppointmentPrice),
    doctorProfileController.updateAppointmentPrice
  );

/**
 * @openapi
 * /doctor/profile/update-appointmentPrice:
 *  post:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router.route('/get-doctor-clinictimings').get(authdoctornonverified(), doctorProfileController.getDoctorClinicTimings);

/**
 * @openapi
 * /doctor/profile/:
 *  post:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router.route('/').get(authdoctorverified(), doctorProfileController.fetchprofiledetails); // ISE

/**
 * @openapi
 * /doctor/profile/send-quries:
 *  post:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router
  .route('/send-quries')
  .post(authdoctorverified(), validate(doctorProfileValidator.doctorQueries), doctorProfileController.sendDoctorQueries);

/**
 * @openapi
 * /doctor/profile/billing:
 *  post:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router.route('/billing').get(authdoctornonverified(), doctorProfileController.getBillingDetails);

/**
 * @openapi
 * /doctor/profile/send-queries:
 *  post:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router
  .route('/send-queries')
  .post(authdoctorverified(), validate(doctorProfileValidator.doctorQueries), doctorProfileController.sendDoctorQueries);

/**
 * @openapi
 * /doctor/profile/get-doctor-queries:
 *  get:
 *     tags:
 *     - doctor
 *     - doctor profile
 */
router.route('/get-doctor-queries').get(authdoctorverified(), doctorProfileController.getDoctorQueries);

module.exports = router;
