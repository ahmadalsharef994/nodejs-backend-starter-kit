const express = require('express');
const authuser = require('../../middlewares/authUser');
const validate = require('../../middlewares/validate');
const { appointmentController, userAppointmentController } = require('../../controllers');
const appointmentValidation = require('../../validations/appointment.validation');

const router = express.Router();

router
  .route('/book-appointment')
  .post(authuser(), validate(appointmentValidation.bookAppointment), appointmentController.bookAppointment);

router
  .route('/patient-join')
  .post(authuser(), validate(appointmentValidation.joinAppointment), appointmentController.joinAppointmentUser);

router.route('/upcoming-appointments').get(authuser(), userAppointmentController.upcomingAppointments);
router.route('/next-appointment').get(authuser(), userAppointmentController.getNextAppointment);
router.route('/prescriptions').get(authuser(), userAppointmentController.showPrescriptions);
// router.route('/labtest-orders').get(authuser(), userAppointmentController.showLabTestOrders);
router
  .route('/appointment-status')
  .get(
    authuser(),
    validate(appointmentValidation.getAppointmentsByStatus),
    userAppointmentController.getAppointmentsByStatus
  );
router
  .route('/appointment-type')
  .get(authuser(), validate(appointmentValidation.getAppointmentsByType), userAppointmentController.getAppointmentsByType);

// router
//   .route('/:appointmentId/patient-feedback')
//   .post(authuser(), validate(appointmentValidation.getUserFeedback), appointmentController.getUserFeedback);
router
  .route('/fetchdoctors-by-categories')
  .post(
    authuser(),
    validate(appointmentValidation.getDoctorsByCategories),
    userAppointmentController.getDoctorsByCategories
  );
router.route('/get-slots').post(authuser(), validate(appointmentValidation.getSlots), userAppointmentController.getSlots);
// router
//   .route('/bookingConfirmation')
//   .post(validate(appointmentValidation.bookingConfirmation), appointmentController.bookingConfirmation);
// router.route('/fetchHealthPackages').get(authuser(), userAppointmentController.fetchHealthPackages);

module.exports = router;
