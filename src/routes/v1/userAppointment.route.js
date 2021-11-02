const express = require('express');
const authUser = require('../../middlewares/authUser');
const validate = require('../../middlewares/validate');
const appointmentValidation = require('../../validations/appointment.validation');
const appointmentController = require('../../controllers/appointment.controller');

const router = express.Router();

router.post('/book-appointment', authUser(), appointmentController.bookAppointment);
router.post(
  '/patient-join',
  authUser(),
  validate(appointmentValidation.joinAppointmentDoctor),
  appointmentController.joinAppointmentPatient
);
module.exports = router;
