const express = require('express');
const authdoctorverified = require('../../middlewares/authDoctorVerified');
const validate = require('../../middlewares/validate');
const appointmentValidation = require('../../validations/appointment.validation');
const appointmentController = require('../../controllers/appointment.controller');
const chatAuth = require('../../middlewares/chatAuth');
const authUserDoctor = require('../../middlewares/authUserDoctor');
const chatController = require('../../controllers/chat.controller');
const chatValidation = require('../../validations/chat.validation');

const router = express.Router();

/* router.post(
  '/init',
  authdoctorverified(),
  validate(appointmentValidation.joinAppointmentDoctor),
  appointmentController.initAppointmentDoctor
); This is used fot Initiaing Appointment Session Manually while testing */

router
  .route('/all-appointments')
  .get(authdoctorverified(), validate(appointmentValidation.getAllAppointments), appointmentController.showAllAppointments);
router.get(
  '/:appointmentId',
  authdoctorverified(),
  validate(appointmentValidation.getappointment),
  appointmentController.getappointmentDoctor
);
router.route('/upcoming-appointments').get(authdoctorverified(), appointmentController.showUpcomingAppointments);
router.post(
  '/doctor-join',
  authdoctorverified(),
  validate(appointmentValidation.joinAppointmentDoctor),
  appointmentController.joinAppointmentDoctor
);
router
  .route('/:appointmentId/follow-ups')
  .get(authdoctorverified(), validate(appointmentValidation.getFollowups), appointmentController.showFollowups);
router
  .route('/:appointmentId/assign-followup')
  .post(authdoctorverified(), validate(appointmentValidation.assignfollowupDetails), appointmentController.assignFollowup);
router.post(
  '/:appointmentId/prescription',
  authdoctorverified(),
  validate(appointmentValidation.createprescription),
  appointmentController.createPrescription
);
router.get(
  '/:appointmentId/prescription/:prescriptionId',
  authdoctorverified(),
  validate(appointmentValidation.getprescription),
  appointmentController.getPrescription
);
router.get('/getpatients', authdoctorverified(), appointmentController.getAllPatientDetails);
router.get(
  '/patients/:patientId',
  authdoctorverified(),
  validate(appointmentValidation.getDetailsPatient),
  appointmentController.getPatientDetails
);
router.post(
  '/:appointmentId/doctor-feedback',
  authdoctorverified(),
  validate(appointmentValidation.doctorFeedback),
  appointmentController.doctorFeedback
);
// Chat API's
router
  .route('/:appointmentId/get-messages')
  .get(authUserDoctor(), validate(chatValidation.getChat), chatController.showChat);
router
  .route('/:appointmentId/send-message')
  .post(chatAuth(), validate(chatValidation.sendMessage), chatController.sendMessage);

module.exports = router;
