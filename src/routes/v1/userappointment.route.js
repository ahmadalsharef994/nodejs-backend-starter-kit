const express = require('express');
const authuser = require('../../middlewares/authUser');
const validate = require('../../middlewares/validate');
const appointmentController = require('../../controllers/appointment.controller');
const appointmentValidation = require('../../validations/appointment.validation');

const router = express.Router();

router
  .route('/book-appointment')
  .post(authuser(), validate(appointmentValidation.bookAppointmentDetails), appointmentController.bookAppointment);

module.exports = router;
