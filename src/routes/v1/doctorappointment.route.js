const express = require('express');
const authdoctornonverified = require('../../middlewares/authDoctorNonVerified');
const validate = require('../../middlewares/validate');
const appointmentValidation = require('../../validations/appointment.validation');
const appointmentController = require('../../controllers/appointment.controller');

const router = express.Router();

router.post(
  '/:appointmentId/doctor-initiate',
  authdoctornonverified(),
  validate(appointmentValidation.initiateappointment),
  appointmentController.initiateappointmentDoctor
);

module.exports = router;
