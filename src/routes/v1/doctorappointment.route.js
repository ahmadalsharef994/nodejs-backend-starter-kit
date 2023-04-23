const express = require('express');
const authdoctorverified = require('../../middlewares/authDoctorVerified');
const validate = require('../../middlewares/validate');
const appointmentValidator = require('../../validations/appointment.validation');
const appointmentController = require('../../controllers/doctorAppointment.controller');
const authUserDoctor = require('../../middlewares/authUserDoctor');
const chatController = require('../../controllers/chat.controller');
const chatValidator = require('../../validations/chat.validation');

const router = express.Router();

router.post(
  '/doctor-join',
  authdoctorverified(),
  validate(appointmentValidator.joinAppointment),
  appointmentController.joinAppointmentDoctor
);

// router
//   .route('/reschedule-appointment')
//   .post(
//     authdoctorverified(),
//     validate(appointmentValidator.rescheduleAppointment),
//     appointmentController.rescheduleAppointment
//   );

router
  .route('/cancel-booking')
  .post(authdoctorverified(), validate(appointmentValidator.cancelAppointment), appointmentController.cancelAppointment); // cancelAppointment

router.route('/upcoming-appointments').get(authdoctorverified(), appointmentController.getUpcomingAppointments);

// router
//   .route('/delete-slot')
//   .post(authdoctorverified(), validate(appointmentValidator.deleteSlot), appointmentController.deleteSlot);

router
  .route('/appointments-status')
  .get(
    authdoctorverified(),
    validate(appointmentValidator.getAppointmentsByStatus),
    appointmentController.getAppointmentsByStatus
  );

// get appointments by status/all
router
  .route('/appointments-type')
  .get(
    authdoctorverified(),
    validate(appointmentValidator.getAppointmentsByType),
    appointmentController.getAppointmentsByType
  );

// get followup slots available for booking
// router.route('/get-available-followups').post(authdoctorverified(), appointmentController.getAvailableFollowUps);
// gets appointment that is going to attend meeting with doctor
router.route('/get-next-appointment').get(authdoctorverified(), appointmentController.getNextAppointmentDoctor);

//  get appointment slots available for booking (public)
router.route('/get-available-appointments').get(authdoctorverified(), appointmentController.getAvailableAppointments); // getAvailableAppointments

// router.route('/doctor-all-appointments').get(authdoctorverified(), appointmentController.allAppointments);

router.get('/getpatients', authdoctorverified(), appointmentController.getPatients); // getPatients
router.get(
  '/patients/:patientId',
  authdoctorverified(),
  validate(appointmentValidator.getPatientDetails),
  appointmentController.getPatientDetails
);

// router.get(
//   '/:appointmentId/appoinment-details',
//   authdoctorverified(),
//   validate(appointmentValidator.getAppointmentDetails),
//   appointmentController.getAppointmentDetails
// );

router.get(
  '/:appointmentId',
  authdoctorverified(),
  validate(appointmentValidator.getappointment),
  appointmentController.getAppointmentById
);

// router
//   .route('/:appointmentId/follow-ups')
//   .get(authdoctorverified(), validate(appointmentValidator.getFollowups), appointmentController.getFollowupsById);

// router
//   .route('/cancel-followup')
//   .post(authdoctorverified(), validate(appointmentValidator.cancelFollowup), appointmentController.cancelFollowup);

router.post(
  '/:appointmentId/prescription',
  authdoctorverified(),
  validate(appointmentValidator.createPrescription),
  appointmentController.createPrescription
);
router.get(
  '/:appointmentId/prescription/:prescriptionId',
  authdoctorverified(),
  validate(appointmentValidator.getPrescription),
  appointmentController.getPrescription
);
// router.post(
//   '/:appointmentId/doctor-feedback',
//   authdoctorverified(),
//   validate(appointmentValidator.getDoctorFeedback),
//   appointmentController.getDoctorFeedback
// );

router
  .route('/:appointmentId/get-messages')
  .get(authUserDoctor(), validate(chatValidator.getMessages), chatController.getMessages);

module.exports = router;
