const express = require('express');
const authdoctorverified = require('../../middlewares/authDoctorVerified');
const validate = require('../../middlewares/validate');
const appointmentValidator = require('../../validations/appointment.validation');
const appointmentController = require('../../controllers/appointment.controller');
const chatAuth = require('../../middlewares/chatAuth');
const authUserDoctor = require('../../middlewares/authUserDoctor');
const chatController = require('../../controllers/chat.controller');
const chatValidator = require('../../validations/chat.validation');

const router = express.Router();

router.post(
  '/init',
  authdoctorverified(),
  validate(appointmentValidator.joinAppointmentDoctor),
  appointmentController.initAppointmentDoctor
);
// This is used fot Initiaing Appointment Session Manually while testing

router.post(
  '/doctor-join',
  authdoctorverified(),
  validate(appointmentValidator.joinAppointmentDoctor),
  appointmentController.joinAppointmentDoctor
);

router
  .route('/reschedule-appointment')
  .post(authdoctorverified(), validate(appointmentValidator.rescheduleAppointment), appointmentController.rescheduleBooking);

router
  .route('/cancel-booking')
  .post(authdoctorverified(), validate(appointmentValidator.cancelAppointment), appointmentController.cancelBooking);

router.route('/upcoming-appointments').get(authdoctorverified(), appointmentController.showUpcomingAppointments);

// get appointments by type/all
router
  .route('/appointments-type')
  .get(
    authdoctorverified(),
    validate(appointmentValidator.getAppointmentsByType),
    appointmentController.showAppointmentsByType
  );
// get followup slots available for booking
router.route('/get-available-followups').post(authdoctorverified(), appointmentController.showAvailableFollowUps);

//  get appointment slots available for booking (public)
router
  .route('/get-available-appointments')
  .post(validate(appointmentValidator.getAvailableAppointmentSlots), appointmentController.showAvailableAppointments);

router.get('/getpatients', authdoctorverified(), appointmentController.getAllPatientDetails);
router.get(
  '/patients/:patientId',
  authdoctorverified(),
  validate(appointmentValidator.getDetailsPatient),
  appointmentController.getPatientDetails
);

router.get(
  '/:appointmentId/appoinment-details',
  authdoctorverified(),
  validate(appointmentValidator.getappointment),
  appointmentController.getappointmentDetails
);
router.get(
  '/:appointmentId',
  authdoctorverified(),
  validate(appointmentValidator.getappointment),
  appointmentController.getappointmentDoctor
);

router
  .route('/:appointmentId/follow-ups')
  .get(authdoctorverified(), validate(appointmentValidator.getFollowups), appointmentController.showFollowUpsById);
router
  .route('/:appointmentId/assign-followup')
  .post(authdoctorverified(), validate(appointmentValidator.assignfollowupDetails), appointmentController.assignFollowup);
router
  .route('/cancel-followup')
  .post(authdoctorverified(), validate(appointmentValidator.cancelFollowup), appointmentController.cancelfollowup);
router
  .route('/reschedule-followup')
  .post(authdoctorverified(), validate(appointmentValidator.rescheduleFollowup), appointmentController.rescheduleFollowup);
router.post(
  '/:appointmentId/prescription',
  authdoctorverified(),
  validate(appointmentValidator.createprescription),
  appointmentController.createPrescription
);
router.get(
  '/:appointmentId/prescription/:prescriptionId',
  authdoctorverified(),
  validate(appointmentValidator.getprescription),
  appointmentController.getPrescription
);
router.post(
  '/:appointmentId/doctor-feedback',
  authdoctorverified(),
  validate(appointmentValidator.doctorFeedback),
  appointmentController.doctorFeedback
);
// Chat API's
router.route('/:appointmentId/get-messages').get(authUserDoctor(), validate(chatValidator.getChat), chatController.showChat);
router
  .route('/:appointmentId/send-message')
  .post(chatAuth(), validate(chatValidator.sendMessage), chatController.sendMessage);

module.exports = router;
