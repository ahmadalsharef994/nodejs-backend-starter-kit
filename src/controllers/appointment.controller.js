const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, appointmentService } = require('../services');
const prescriptionUpload = require('../Microservices/generatePrescription.service');

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
    req.body.status,
    req.body.type,
    req.body.startTime,
    req.body.endTime
  );
  res.status(httpStatus.CREATED).json({ message: 'Hurray! Appointment Booked', AppointmentDetails });
});

const getappointmentDoctor = catchAsync(async (req, res) => {
  // const AuthData = await authService.getAuthById(req.SubjectId);
  const DoctorSession = await appointmentService.getappointmentDoctor(req.params.appointmentId);
  res.status(httpStatus.CREATED).json({ DoctorSession });
});

const createPrescription = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const prescriptionDoc = await prescriptionUpload.generatePrescription();
  await appointmentService.createPrescription(prescriptionDoc, req.body, AuthData);
  res.status(httpStatus.CREATED).json({ prescriptionDoc });
});

const getPrescription = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const prescriptionData = await appointmentService.getappointmentDoctor(AuthData);
  res.status(httpStatus.CREATED).json({ prescriptionData });
});

module.exports = {
  initiateappointmentDoctor,
  bookAppointment,
  getappointmentDoctor,
  createPrescription,
  getPrescription,
};
