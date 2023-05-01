const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const validate = require('../../middlewares/validate');
const doctorProfileValidator = require('../../validations/DoctorProfile.validation');
const doctorProfileController = require('../../controllers/doctorprofile.controller');
const authDoctor = require('../../middlewares/authDoctor');
const authdoctorverified = require('../../middlewares/authDoctorVerified');
const appointmentPreferenceValidator = require('../../validations/appointmentpreference.validation');
// const profilePhotoUpload = require('../../Microservices/profilePicture.service');
const { appointmentController } = require('../../controllers');
const { doctorprofileService } = require('../../services');

const router = express.Router();

router.route('/stats').get(authdoctorverified(), doctorProfileController.getStats); // doctorProfileController, getStats
router.route('/basic-details').get(authDoctor(), doctorProfileController.fetchbasicdetails); // getBasicDetails

router.route('/basic-details').post(
  authDoctor(),
  // doctorBasicDetails
  validate(doctorProfileValidator.BasicDoctorDetails),
  doctorProfileController.submitbasicdetails
); // postBasicDetails

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 2000000 }, // 2MB limit
  fileFilter,
});

// Set up Cloudinary for image uploading
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.route('/basic-details/profile-picture').post(authDoctor(), upload.single('avatar'), async (req, res, next) => {
  // doctorProfileController.submitprofilepicture(req);
  // const location = req.files.avatar[0].location;
  // res.status(201).json({ message: 'Profile picture Updated!', location });
  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'avatar' });

    // Call the controller method to update the esign field in the database
    const auth = req.SubjectId;

    const updated = await doctorprofileService.submitprofilepicture(result.secure_url, auth);

    // Check if the update was successful
    if (updated) {
      res.status(200).json({ message: 'avatar updated', location: result.secure_url });
    } else {
      res.status(500).json({ message: 'Failed to update avatar' });
    }
  } catch (error) {
    next(error);
  }
});

router.route('/education-details').get(authDoctor(), doctorProfileController.fetcheducationdetails);
router
  .route('/education-details')
  .post(
    authDoctor(),
    validate(doctorProfileValidator.EducationDoctorDetails),
    doctorProfileController.submiteducationdetails
  );

router.route('/experience-details').get(authDoctor(), doctorProfileController.fetchexperiencedetails);
router
  .route('/experience-details')
  .post(
    authDoctor(),
    validate(doctorProfileValidator.ExperienceDoctorDetails),
    doctorProfileController.submitexperiencedetails
  );

router.route('/clinic-details').get(authDoctor(), doctorProfileController.fetchclinicdetails);
router
  .route('/clinic-details')
  .post(authDoctor(), validate(doctorProfileValidator.ClinicDoctorDetails), doctorProfileController.submitclinicdetails);
router
  .route('/updatePref')
  .put(
    authdoctorverified(),
    validate(appointmentPreferenceValidator.preferenceDetails),
    appointmentController.updateAppointmentPreference
  );

// get all appointment preference slots
router.route('/getappointments').get(authdoctorverified(), appointmentController.getAppointmentPreferences);

// get all followup preference slots
// router.route('/getfollowups').get(authdoctorverified(), appointmentPreferenceController.showFollowups);

router.route('/payout-details').get(authDoctor(), doctorProfileController.fetchpayoutsdetails);
router
  .route('/payout-details')
  .post(authDoctor(), validate(doctorProfileValidator.PayoutsDoctorDetails), doctorProfileController.submitpayoutsdetails);
// router.post(
//   '/consultationfee',
//   authdoctorverified(),
//   validate(doctorProfileValidator.addConsultationfee),
//   doctorProfileController.addConsultationfee
// );
// router.post(
//   '/notifications',
//   authdoctorverified(),
//   validate(doctorProfileValidator.notificationSettings),
//   doctorProfileController.updateNotificationSettings
// );
// router
//   .route('/submit-education-and-experience')
//   .post(authDoctor(), validate(doctorProfileValidator.EducationExperience), doctorProfileController.doctorExpandEducation);
// router
//   .route('/update-clinic-timings')
//   .post(authdoctorverified(), validate(doctorProfileValidator.timings), doctorProfileController.updateClinicDetails);
// router
//   .route('/update-details')
//   .post(authDoctor(), validate(doctorProfileValidator.updateDetails), doctorProfileController.updateDetails);
router
  .route('/update-appointmentPrice')
  .post(
    authDoctor(),
    validate(doctorProfileValidator.updateAppointmentPrice),
    doctorProfileController.updateAppointmentPrice
  );
// router.route('/get-doctor-clinictimings').get(authDoctor(), doctorProfileController.getDoctorClinicTimings);

router.route('/').get(authdoctorverified(), doctorProfileController.fetchprofiledetails); // ISE

// router
//   .route('/send-quries')
//   .post(authdoctorverified(), validate(doctorProfileValidator.doctorQueries), doctorProfileController.sendDoctorQueries);

router.route('/billing').get(authDoctor(), doctorProfileController.getBillingDetails);

// router
//   .route('/send-queries')
//   .post(authdoctorverified(), validate(doctorProfileValidator.doctorQueries), doctorProfileController.sendDoctorQueries);

// router.route('/get-doctor-queries').get(authdoctorverified(), doctorProfileController.getDoctorQueries);

module.exports = router;
