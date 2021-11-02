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

module.exports = router;
