const express = require('express');
const router = express.Router();
const authdoctorverified = require('../../middlewares/authDoctorVerified');
const { appointmentPrefController } = require('../../controllers');

router.get('/getfollowups', authdoctorverified(), appointmentPrefController.showfollowups);
router.get('/getdoctorappointments', appointmentPrefController.showpappointments);
router.put('/updatepreferences', authdoctorverified(), appointmentPrefController.changepref);//VakidationRequired
router.post('/setpreference', authdoctorverified(), appointmentPrefController.submitDoctorAppointmentPref); //VakidationRequired

module.exports = router;
