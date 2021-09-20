const express = require('express');
const validate = require('../../middlewares/validate');
const authdoctorverified = require('../../middlewares/authDoctorVerified');
const appointmentPreferenceController = require('../../controllers/appointmentpreference.controller');
const preferenceValidator = require('../../validations/appointmentpreference.validation');

const router = express.Router();

router.get('/getdoctorfollowups', authdoctorverified(), appointmentPreferenceController.showfollowups);
router.put(
  '/updateappointmentpreference',
  authdoctorverified(),
  validate(preferenceValidator.PreferenceDetails),
  appointmentPreferenceController.updateAppointmentPreference // ValidationRequired
);
router.post(
  '/submitappointmentpreference',
  authdoctorverified(),
  validate(preferenceValidator.PreferenceDetails),
  appointmentPreferenceController.submitAppointmentPreference // ValidationRequired
);
router.post('/getdoctorappointments', appointmentPreferenceController.showappointments);

module.exports = router;
