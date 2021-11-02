const express = require('express');
const authdoctornonverified = require('../../middlewares/authDoctorNonVerified');
const validate = require('../../middlewares/validate');
const appointmentValidation = require('../../validations/appointment.validation');
const appointmentController = require('../../controllers/appointment.controller');
const authdoctorverified = require('../../middlewares/authDoctorVerified');

const router = express.Router();

router.post(
  '/:appointmentId/doctor-initiate',
  authdoctornonverified(),
  validate(appointmentValidation.initiateappointment),
  appointmentController.initiateappointmentDoctor
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

module.exports = router;
