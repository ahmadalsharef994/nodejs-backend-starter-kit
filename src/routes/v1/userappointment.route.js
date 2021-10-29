const express = require('express');
const authuser = require('../../middlewares/authUser');
// const validate = require('../../middlewares/validate');
const appointmentController = require('../../controllers/appointment.controller');

const router = express.Router();

router.route('/book-appointment').post(authuser(), appointmentController.bookAppointment);

module.exports = router;
