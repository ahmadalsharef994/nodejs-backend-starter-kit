const express = require('express');
const authdoctorverified = require('../../middlewares/authDoctorVerified');
const validate = require('../../middlewares/validate');
const appointmentValidator = require('../../validations/appointment.validation');
const appointmentController = require('../../controllers/appointment.controller');
// const chatAuth = require('../../middlewares/chatAuth');
const authUserDoctor = require('../../middlewares/authUserDoctor');
const chatController = require('../../controllers/chat.controller');
const chatValidator = require('../../validations/chat.validation');

const router = express.Router();

// router.post(
//   '/init',
//   authdoctorverified(),
//   validate(appointmentValidator.joinAppointmentDoctor),
//   appointmentController.initAppointmentDoctor
// );
// This is used fot Initiaing Appointment Session Manually while testing

router.post(
  '/doctor-join',
  authdoctorverified(),
  validate(appointmentValidator.joinAppointmentDoctor),
  appointmentController.joinAppointmentDoctor
);

router
  .route('/reschedule-appointment')
  .post(
    authdoctorverified(),
    validate(appointmentValidator.rescheduleAppointment),
    appointmentController.rescheduleAppointment
  ); // rescheduleAppointment

router
  .route('/cancel-booking')
  .post(authdoctorverified(), validate(appointmentValidator.cancelAppointment), appointmentController.cancelAppointment); // cancelAppointment

router.route('/upcoming-appointments').get(authdoctorverified(), appointmentController.getUpcomingAppointments);
router
  .route('/delete-slot')
  .post(authdoctorverified(), validate(appointmentValidator.deleteSlot), appointmentController.deleteSlot);
// get appointments by type/all
router
  .route('/appointments-type')
  .get(
    authdoctorverified(),
    validate(appointmentValidator.getAppointmentsByType),
    appointmentController.getAppointmentsByType
  );
// get followup slots available for booking
router.route('/get-available-followups').post(authdoctorverified(), appointmentController.getAvailableFollowUps);
// gets appointment that is going to attend meeting with doctor
router.route('/get-next-appointment').get(authdoctorverified(), appointmentController.getTodaysUpcomingAppointment);

//  get appointment slots available for booking (public)
router.route('/get-available-appointments').get(authdoctorverified(), appointmentController.getAvailableAppointments); // getAvailableAppointments

router.route('/doctor-all-appointments').get(authdoctorverified(), appointmentController.allAppointments);
router.get('/getpatients', authdoctorverified(), appointmentController.getPatients); // getPatients
router.get(
  '/patients/:patientId',
  authdoctorverified(),
  validate(appointmentValidator.getPatientDetails),
  appointmentController.getPatientDetails
);

router.get(
  '/:appointmentId/appoinment-details',
  authdoctorverified(),
  validate(appointmentValidator.getAppointmentDetails),
  appointmentController.getAppointmentDetails
);
router.get(
  '/:appointmentId',
  authdoctorverified(),
  validate(appointmentValidator.getappointment),
  appointmentController.getAppointmentById
);

router
  .route('/:appointmentId/follow-ups')
  .get(authdoctorverified(), validate(appointmentValidator.getFollowups), appointmentController.getFollowupsById);
// router
//   .route('/:appointmentId/assign-followup')
//   .post(authdoctorverified(), validate(appointmentValidator.assignFollowup), appointmentController.assignFollowup);
router
  .route('/cancel-followup')
  .post(authdoctorverified(), validate(appointmentValidator.cancelFollowup), appointmentController.cancelFollowup);
// router
//   .route('/reschedule-followup')
//   .post(authdoctorverified(), validate(appointmentValidator.rescheduleFollowup), appointmentController.rescheduleFollowup);
router.post(
  '/:appointmentId/prescription',
  authdoctorverified(),
  validate(appointmentValidator.createPrescription),
  appointmentController.createPrescription
);
router.get(
  '/:appointmentId/prescription/:prescriptionId',
  authdoctorverified(),
  validate(appointmentValidator.getPrescription),
  appointmentController.getPrescription
);
router.post(
  '/:appointmentId/doctor-feedback',
  authdoctorverified(),
  validate(appointmentValidator.getDoctorFeedback),
  appointmentController.getDoctorFeedback
);
// Chat API's
router
  .route('/:appointmentId/get-messages')
  .get(authUserDoctor(), validate(chatValidator.getMessages), chatController.getMessages);

// router
//   .route('/:appointmentId/send-message')
//   .post(chatAuth(), validate(chatValidator.sendMessage), chatController.sendMessage);

module.exports = router;
