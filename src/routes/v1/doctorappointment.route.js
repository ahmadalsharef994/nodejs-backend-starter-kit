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

/**
 * @openapi
 * /doctor/appointment/init:
 *  post:
 *     tags:
 *     - doctor
 *     - appointments
 */
router.post(
  '/init',
  authdoctorverified(),
  validate(appointmentValidator.joinAppointmentDoctor),
  appointmentController.initAppointmentDoctor
);
// This is used fot Initiaing Appointment Session Manually while testing

/**
 * @openapi
 * /doctor/appointment/doctor-join:
 *  post:
 *     tags:
 *     - doctor
 *     - appointments
 */
router.post(
  '/doctor-join',
  authdoctorverified(),
  validate(appointmentValidator.joinAppointmentDoctor),
  appointmentController.joinAppointmentDoctor
);

/**
 * @openapi
 * /doctor/appointment/reschedule-appointment:
 *  post:
 *     tags:
 *     - doctor
 *     - appointments
 */
router
  .route('/reschedule-appointment')
  .post(
    authdoctorverified(),
    validate(appointmentValidator.rescheduleAppointment),
    appointmentController.rescheduleAppointment
  ); // rescheduleAppointment

/**
 * @openapi
 * /doctor/appointment/cancel-booking:
 *  post:
 *     tags:
 *     - doctor
 *     - appointments
 */
router
  .route('/cancel-booking')
  .post(authdoctorverified(), validate(appointmentValidator.cancelAppointment), appointmentController.cancelAppointment); // cancelAppointment

/**
 * @openapi
 * /doctor/appointment/upcoming-appointments:
 *  get:
 *     tags:
 *     - doctor
 *     - appointments
 */
router.route('/upcoming-appointments').get(authdoctorverified(), appointmentController.getUpcomingAppointments);

/**
 * @openapi
 * /doctor/appointment/delete-slot:
 *  post:
 *     tags:
 *     - doctor
 *     - appointments
 */
router
  .route('/delete-slot')
  .post(authdoctorverified(), validate(appointmentValidator.deleteSlot), appointmentController.deleteSlot);

// get appointments by type/all
/**
 * @openapi
 * /doctor/appointment/appointments-type:
 *  get:
 *     tags:
 *     - doctor
 *     - appointments
 */
router
  .route('/appointments-type')
  .get(
    authdoctorverified(),
    validate(appointmentValidator.getAppointmentsByType),
    appointmentController.getAppointmentsByType
  );

// get followup slots available for booking
/**
 * @openapi
 * /doctor/appointment/get-available-followups:
 *  post:
 *     tags:
 *     - doctor
 *     - appointments
 */
router.route('/get-available-followups').post(authdoctorverified(), appointmentController.getAvailableFollowUps);

//  get appointment slots available for booking (public)
/**
 * @openapi
 * /doctor/appointment/get-available-appointments:
 *  get:
 *     tags:
 *     - doctor
 *     - appointments
 */
router.route('/get-available-appointments').get(authdoctorverified(), appointmentController.getAvailableAppointments); // getAvailableAppointments

/**
 * @openapi
 * /doctor/appointment/doctor-all-appointments:
 *  get:
 *     tags:
 *     - doctor
 *     - appointments
 */
router.route('/doctor-all-appointments').get(authdoctorverified(), appointmentController.allAppointments);

/**
 * @openapi
 * /doctor/appointment/getpatients:
 *  get:
 *     tags:
 *     - doctor
 *     - appointments
 */
router.get('/getpatients', authdoctorverified(), appointmentController.getPatients); // getPatients

/**
 * @openapi
 * /doctor/appointment/patients/:patientId:
 *  get:
 *     tags:
 *     - doctor
 *     - appointments
 */
router.get(
  '/patients/:patientId',
  authdoctorverified(),
  validate(appointmentValidator.getPatientDetails),
  appointmentController.getPatientDetails
);

/**
 * @openapi
 * /doctor/appointment/:appointmentId/appoinment-details:
 *  get:
 *     tags:
 *     - doctor
 *     - appointments
 */
router.get(
  '/:appointmentId/appoinment-details',
  authdoctorverified(),
  validate(appointmentValidator.getAppointmentDetails),
  appointmentController.getAppointmentDetails
);

/**
 * @openapi
 * /doctor/appointment/:appointmentId:
 *  get:
 *     tags:
 *     - doctor
 *     - appointments
 */
router.get(
  '/:appointmentId',
  authdoctorverified(),
  validate(appointmentValidator.getappointment),
  appointmentController.getAppointmentById
);

/**
 * @openapi
 * /doctor/appointment/:appointmentId/follow-ups:
 *  get:
 *     tags:
 *     - doctor
 *     - appointments
 */
router
  .route('/:appointmentId/follow-ups')
  .get(authdoctorverified(), validate(appointmentValidator.getFollowups), appointmentController.getFollowupsById);

/**
 * @openapi
 * /doctor/appointment/:appointmentId/assign-followup:
 *  post:
 *     tags:
 *     - doctor
 *     - appointments
 */
router
  .route('/:appointmentId/assign-followup')
  .post(authdoctorverified(), validate(appointmentValidator.assignFollowup), appointmentController.assignFollowup);

/**
 * @openapi
 * /doctor/appointment/cancel-followup:
 *  post:
 *     tags:
 *     - doctor
 *     - appointments
 */
router
  .route('/cancel-followup')
  .post(authdoctorverified(), validate(appointmentValidator.cancelFollowup), appointmentController.cancelFollowup);

/**
 * @openapi
 * /doctor/appointment/reschedule-followup:
 *  post:
 *     tags:
 *     - doctor
 *     - appointments
 */
router
  .route('/reschedule-followup')
  .post(authdoctorverified(), validate(appointmentValidator.rescheduleFollowup), appointmentController.rescheduleFollowup);

/**
 * @openapi
 * /doctor/appointment/:appointmentId/prescription:
 *  post:
 *     tags:
 *     - doctor
 *     - appointments
 */
router.post(
  '/:appointmentId/prescription',
  authdoctorverified(),
  validate(appointmentValidator.createPrescription),
  appointmentController.createPrescription
);

/**
 * @openapi
 * /doctor/appointment/:appointmentId/prescription/:prescriptionId:
 *  get:
 *     tags:
 *     - doctor
 *     - appointments
 */
router.get(
  '/:appointmentId/prescription/:prescriptionId',
  authdoctorverified(),
  validate(appointmentValidator.getPrescription),
  appointmentController.getPrescription
);

/**
 * @openapi
 * /doctor/appointment/:appointmentId/doctor-feedback:
 *  post:
 *     tags:
 *     - doctor
 *     - appointments
 */
router.post(
  '/:appointmentId/doctor-feedback',
  authdoctorverified(),
  validate(appointmentValidator.getDoctorFeedback),
  appointmentController.getDoctorFeedback
);

// Chat API's
/**
 * @openapi
 * /doctor/appointment/:appointmentId/get-messages:
 *  get:
 *     tags:
 *     - doctor
 *     - appointments
 */
router
  .route('/:appointmentId/get-messages')
  .get(authUserDoctor(), validate(chatValidator.getMessages), chatController.getMessages);

/**
 * @openapi
 * /doctor/appointment/:appointmentId/send-message:
 *  post:
 *     tags:
 *     - doctor
 *     - appointments
 */
router
  .route('/:appointmentId/send-message')
  .post(chatAuth(), validate(chatValidator.sendMessage), chatController.sendMessage);

module.exports = router;
