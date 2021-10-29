const express = require('express');
const authUser = require('../../middlewares/authUser');
const appointmentController = require('../../controllers/appointment.controller');

const router = express.Router();

router.post('/book-appointment', authUser(), appointmentController.bookAppointment);
module.exports = router;
