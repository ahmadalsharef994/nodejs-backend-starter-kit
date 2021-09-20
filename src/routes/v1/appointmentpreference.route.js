const express = require('express');
const validate = require('../../middlewares/validate');
const authdoctorverified = require('../../middlewares/authDoctorVerified');
const appointmentPreferenceController = require('../../controllers/appointmentpreference.controller');
const preferenceValidator = require('../../validations/appointmentpreference.validation');

const router = express.Router();

router.get('/getfollowups', authdoctorverified(), appointmentPreferenceController.showfollowups);
router.put(
  '/updateappointmentpreference',
  authdoctorverified(),
  validate(preferenceValidator.PreferenceDetails),
  appointmentPreferenceController.updateAppointmentPreference
);
router.post(
  '/createappointmentpreference',
  authdoctorverified(),
  validate(preferenceValidator.PreferenceDetails),
  appointmentPreferenceController.submitAppointmentPreference
);
router.post('/getappointments', appointmentPreferenceController.showappointments);

module.exports = router;
