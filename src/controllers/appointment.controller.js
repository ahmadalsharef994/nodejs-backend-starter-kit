const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, appointmentService } = require('../services');

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

module.exports = {
  initiateappointmentDoctor,
  bookAppointment,
  assignFollowup,
  showFollowups,
  showUpcomingAppointments,
  showAllAppointments,
};
