const express = require('express');
const authdoctorverified = require('../../middlewares/authDoctorVerified');
const validate = require('../../middlewares/validate');
const appointmentValidation = require('../../validations/appointment.validation');
const appointmentController = require('../../controllers/appointment.controller');

const router = express.Router();

router.post(
  '/init',
  authdoctorverified(),
  validate(appointmentValidation.joinAppointmentDoctor),
  appointmentController.initAppointmentDoctor
);
router.post(
  '/doctor-join',
  authdoctorverified(),
  validate(appointmentValidation.joinAppointmentDoctor),
  appointmentController.joinAppointmentDoctor
);

router.route('/upcoming-appointments').get(authdoctorverified(), appointmentController.showUpcomingAppointments);

router
  .route('/all-appointments')
  .get(authdoctorverified(), validate(appointmentValidation.getAllAppointments), appointmentController.showAllAppointments);

router.get(
  '/patients/:patientId',
  authdoctorverified(),
  validate(appointmentValidation.getDetailsPatient),
  appointmentController.getPatientDetails
);

router.get('/getpatients', authdoctorverified(), appointmentController.getAllPatientDetails);

router
  .route('/:appointmentId/follow-ups')
  .get(authdoctorverified(), validate(appointmentValidation.getFollowups), appointmentController.showFollowups);

router
  .route('/:appointmentId/assign-followup')
  .post(authdoctorverified(), validate(appointmentValidation.assignfollowupDetails), appointmentController.assignFollowup);
router.get(
  '/:appointmentId',
  authdoctorverified(),
  validate(appointmentValidation.getappointment),
  appointmentController.getappointmentDoctor
);

router.post(
  '/:appointmentId/prescription',
  authdoctorverified(),
  validate(appointmentValidation.createprescription),
  appointmentController.createPrescription
);

router.get(
  '/:appointmentId/prescription/:prescriptionId',
  authdoctorverified(),
  validate(appointmentValidation.getprescription),
  appointmentController.getPrescription
);

router.get(
  '/:appointmentId',
  authdoctorverified(),
  validate(appointmentValidation.getappointment),
  appointmentController.getappointmentDoctor
);

router.post(
  '/:appointmentId/prescription',
  authdoctorverified(),
  validate(appointmentValidation.createprescription),
  appointmentController.createPrescription
);

router.post(
  '/consultationfee',
  authdoctorverified(),
  validate(appointmentValidation.addConsultationfee),
  appointmentController.addConsultationfee
);

router.post(
  '/notification',
  authdoctorverified(),
  validate(appointmentValidation.notifications),
  appointmentController.notifications
);

router.post(
  '/:appointmentId/doctor-feedback',
  authdoctorverified(),
  validate(appointmentValidation.doctorFeedback),
  appointmentController.doctorFeedback
);

module.exports = router;
