const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, appointmentService } = require('../services');

const bookAppointment = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const DoctorSession = await appointmentService.initiateappointmentviaDoctor(req.body.appointmentInit, AuthData);
  res.status(httpStatus.CREATED).json(DoctorSession);
});

const joinAppointmentDoctor = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const DoctorSession = await appointmentService.initiateappointmentSession(req.body.appointmentInit, AuthData);
  res.status(httpStatus.CREATED).json(DoctorSession);
});

module.exports = {
  joinAppointmentDoctor,
  bookAppointment,
};
