const express = require('express');
const authuser = require('../../middlewares/authUser');
const validate = require('../../middlewares/validate');
const appointmentController = require('../../controllers/appointment.controller');
const appointmentValidation = require('../../validations/appointment.validation');

const router = express.Router();

router
  .route('/book-appointment')
  .post(authuser(), validate(appointmentValidation.bookAppointmentDetails), appointmentController.bookAppointment);

router
  .route('/patient-join')
  .post(authuser(), validate(appointmentValidation.joinAppointmentUser), appointmentController.joinAppointmentPatient);

module.exports = router;
