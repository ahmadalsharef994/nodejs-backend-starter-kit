const express = require('express');
const authuser = require('../../middlewares/authUser');
const validate = require('../../middlewares/validate');
const { appointmentController, userAppointmentController } = require('../../controllers');
const appointmentValidation = require('../../validations/appointment.validation');

const router = express.Router();

router
  .route('/book-appointment')
  .post(authuser(), validate(appointmentValidation.bookAppointmentDetails), appointmentController.bookAppointment);

router
  .route('/patient-join')
  .post(authuser(), validate(appointmentValidation.joinAppointmentUser), appointmentController.joinAppointmentPatient);

router.route('/upcoming-appointments').get(authuser(), userAppointmentController.upcomingAppointments);
router.route('/prescriptions').get(authuser(), userAppointmentController.showPrescriptions);
router.route('/labtest-orders').get(authuser(), userAppointmentController.showLabTestOrders);
router
  .route('/appointments')
  .get(authuser(), validate(appointmentValidation.getAppointmentsByType), userAppointmentController.showAppointmentsByType);

router
  .route('/:appointmentId/patient-feedback')
  .post(authuser(), validate(appointmentValidation.userFeedback), appointmentController.userFeedback);
router
  .route('/fetchdoctors-by-categories')
  .post(
    authuser(),
    validate(appointmentValidation.getDoctorsByCategories),
    userAppointmentController.getDoctorsByCategories
  );
router
  .route('/bookingConfirmation')
  .post(validate(appointmentValidation.bookingConfirmation), appointmentController.bookingConfirmation);
router.route('/fetchHealthPackages').get(authuser(), userAppointmentController.fetchallHealthPackages);

module.exports = router;
