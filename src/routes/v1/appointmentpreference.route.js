const express = require('express');
const authdoctorverified = require('../../middlewares/authDoctorVerified');
const { appointmentPreferenceController } = require('../../controllers');

const router = express.Router();

router.get('/getdoctorfollowups', authdoctorverified(), appointmentPreferenceController.showfollowups);
router.get('/getdoctorappointments', appointmentPreferenceController.showappointments);
router.put(
  '/updateappointmentpreference',
  authdoctorverified(),
  appointmentPreferenceController.updateAppointmentPreference // ValidationRequired
);
router.post(
  '/submitappointmentpreference',
  authdoctorverified(),
  appointmentPreferenceController.submitAppointmentPreference // ValidationRequired
);

module.exports = router;
