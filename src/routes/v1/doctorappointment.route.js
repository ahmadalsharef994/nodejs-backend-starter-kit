const express = require('express');
const authdoctorverified = require('../../middlewares/authDoctorVerified');
const validate = require('../../middlewares/validate');
const appointmentValidation = require('../../validations/appointment.validation');
const appointmentController = require('../../controllers/appointment.controller');

const router = express.Router();

router.post(
  '/init',
  authdoctorverified(),
  validate(appointmentValidation.joinAppointmentDoctor),
  appointmentController.initAppointmentDoctor
);
router.post(
  '/doctor-join',
  authdoctorverified(),
  validate(appointmentValidation.joinAppointmentDoctor),
  appointmentController.joinAppointmentDoctor
);

router.route('/upcoming-appointments').get(authdoctorverified(), appointmentController.showUpcomingAppointments);
router
  .route('/all-appointments')
  .get(authdoctorverified(), validate(appointmentValidation.getAllAppointments), appointmentController.showAllAppointments);
router
  .route('/:appointmentId/follow-ups')
  .get(authdoctorverified(), validate(appointmentValidation.getFollowups), appointmentController.showFollowups);
router
  .route('/:appointmentId/assign-followup')
  .post(authdoctorverified(), validate(appointmentValidation.followupDetails), appointmentController.assignFollowup);
router.get(
  '/:appointmentId',
  authdoctorverified(),
  validate(appointmentValidation.getappointment),
  appointmentController.getappointmentDoctor
);

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

router.route('/upcoming-appointments').get(authdoctorverified(), appointmentController.showUpcomingAppointments);
router
  .route('/all-appointments')
  .get(authdoctorverified(), validate(appointmentValidation.getAllAppointments), appointmentController.showAllAppointments);
router
  .route('/:appointmentId/follow-ups')
  .get(authdoctorverified(), validate(appointmentValidation.getFollowups), appointmentController.showFollowups);
router
  .route('/:appointmentId/assign-followup')
  .post(authdoctorverified(), validate(appointmentValidation.followupDetails), appointmentController.assignFollowup);
router.get(
  '/:appointmentId',
  authdoctorverified(),
  validate(appointmentValidation.getappointment),
  appointmentController.getappointmentDoctor
);

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

module.exports = router;
