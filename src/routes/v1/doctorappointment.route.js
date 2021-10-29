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

router.get(
  '/:appointmentId',
  authdoctornonverified(),
  validate(appointmentValidation.getappointment),
  appointmentController.getappointmentDoctor
);

router.post(
  ':appointmentId/prescription',
  authdoctornonverified(),
  validate(appointmentValidation.createprescription),
  appointmentController.createPrescription
);

router.get(
  ':appointmentId/prescription',
  authdoctornonverified(),
  validate(appointmentValidation.getprescription),
  appointmentController.getPrescription
);

module.exports = router;
