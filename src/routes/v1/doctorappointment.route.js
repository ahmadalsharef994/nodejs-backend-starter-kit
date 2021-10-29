const express = require('express');
const authdoctorverified = require('../../middlewares/authDoctorVerified');
const validate = require('../../middlewares/validate');
const appointmentValidation = require('../../validations/appointment.validation');
const appointmentController = require('../../controllers/appointment.controller');

const router = express.Router();

router.post(
  '/:appointmentId/doctor-join',
  authdoctorverified(),
  validate(appointmentValidation.joinAppointmentDoctor),
  appointmentController.joinAppointmentDoctor
);

module.exports = router;
