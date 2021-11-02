const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, appointmentService } = require('../services');
// const prescriptionUpload = require('../Microservices/generatePrescription.service');

const initiateappointmentDoctor = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const DoctorSession = await appointmentService.initiateappointmentviaDoctor(req.body.appointmentInit, AuthData);
  res.status(httpStatus.CREATED).json({ DoctorSession });
});

const bookAppointment = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const AppointmentDetails = await appointmentService.submitAppointmentDetails(
    req.body.docId,
    AuthData,
    req.body.startTime,
    req.body.endTime
  );
  res.status(httpStatus.CREATED).json({ message: 'Hurray! Appointment Booked', AppointmentDetails });
});

const assignFollowup = catchAsync(async (req, res) => {
  const FollowupDetails = await appointmentService.submitFollowupDetails(
    req.params.appointmentId,
    req.body.startTime,
    req.body.endTime
  );
  res.status(httpStatus.CREATED).json({ message: 'Followup Slot assigned', FollowupDetails });
});

const showFollowups = catchAsync(async (req, res) => {
  appointmentService.getFollowups(req.params.appointmentId).then((result) => {
    if (result.length === 0) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'No Followups assigned.' });
    }
    return res.status(httpStatus.OK).json(result);
  });
});

const showUpcomingAppointments = catchAsync(async (req, res) => {
  appointmentService.getUpcomingAppointments(req.Docid).then((result) => {
    if (result.length === 0) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'No Upcoming Appointments' });
    }
    return res.status(httpStatus.OK).json(result);
  });
});

const showAllAppointments = catchAsync(async (req, res) => {
  appointmentService.getAllAppointments(req.Docid, req.query.type).then((result) => {
    if (result.length === 0) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'No Appointments to show' });
    }
    return res.status(httpStatus.OK).json(result);
  });
});

const getappointmentDoctor = catchAsync(async (req, res) => {
  const DoctorSession = await appointmentService.getappointmentDoctor(req.params.appointmentId);
  if (DoctorSession !== false) {
    res.status(httpStatus.CREATED).json({ DoctorSession });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'No Appointment present with this id' });
  }
});

const createPrescription = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const Prescription = await appointmentService.createPrescriptionDoc(req.body, AuthData);
  if (Prescription !== false) {
    res.status(httpStatus.CREATED).json({ message: 'Prescription Generated Sucessfully', Prescription });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Unable to create prescription' });
  }
});

const getPrescription = catchAsync(async (req, res) => {
  const prescriptionData = await appointmentService.fetchPrescriptionDoc(req.params.prescriptionId);
  if (prescriptionData !== false) {
    res.status(httpStatus.CREATED).json({ prescriptionData });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'No Prescription present with this id' });
  }
});

module.exports = {
  initiateappointmentDoctor,
  bookAppointment,
  assignFollowup,
  showFollowups,
  showUpcomingAppointments,
  showAllAppointments,
  getappointmentDoctor,
  createPrescription,
  getPrescription,
};
