const express = require('express');

const router = express.Router();
const authdoctorverified = require('../../middlewares/authDoctorVerified');
const { appointmentPrefController } = require('../../controllers');

router.post('/setpref', authdoctorverified(), appointmentPrefController.newpref);
router.get('/getf', appointmentPrefController.showfollowups);
router.get('/geta', appointmentPrefController.showpappointments);
router.put('/updatepref', appointmentPrefController.changepref);

module.exports = router;
