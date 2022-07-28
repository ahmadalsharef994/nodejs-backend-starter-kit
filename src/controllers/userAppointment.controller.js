const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userAppointmentService, appointmentService } = require('../services');
const pick = require('../utils/pick');

const upcomingAppointments = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userAppointmentService.getUpcomingAppointment(req.SubjectId, options);
  if (result.length === 0) {
    return res.status(httpStatus.OK).json({ message: 'No Upcoming Appointments', data: [] });
  }
  return res.status(httpStatus.OK).json(result);
});

const getAppointmentsByType = catchAsync(async (req, res) => {
  const filter = req.query.type;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userAppointmentService.getAppointmentsByType(req.SubjectId, filter, options);
  if (result.length === 0) {
    return res.status(httpStatus.OK).json({ message: 'No Appointments to show', data: [] });
  }
  return res.status(httpStatus.OK).json(result);
});

const showPrescriptions = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userAppointmentService.getAllPrescriptions(AuthData, options);
  if (result.length === 0) {
    return res.status(httpStatus.OK).json({ message: 'No Prescriptions to show', data: [] });
  }
  return res.status(httpStatus.OK).json(result);
});

const showLabTestOrders = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const filter = { Type: req.query.type };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userAppointmentService.getAllLabTestOrders(AuthData, filter, options);
  if (result.length === 0) {
    return res.status(httpStatus.OK).json({ message: 'No Lab Test Orders to show', data: [] });
  }
  return res.status(httpStatus.OK).json(result);
});

const fetchHealthPackages = catchAsync(async (req, res) => {
  const healthpackage = await userAppointmentService.fetchHealthPackages();
  if (healthpackage) {
    res.status(httpStatus.OK).json(healthpackage);
  } else {
    res.status(httpStatus[400]).json({ message: 'something went wrong' });
  }
});
const getDoctorsByCategories = catchAsync(async (req, res) => {
  const { doctorDetails } = await appointmentService.getDoctorsByCategories(req.body.Category);
  if (doctorDetails.length > 0) {
    res.status(httpStatus.OK).json(doctorDetails);
  } else {
    res.status(httpStatus.NOT_FOUND).json({ ERROR: 'Oops ! Doctors Not Found With This Category' });
  }
});
const getNextAppointment = catchAsync(async (req, res) => {
  const nextAppointment = await userAppointmentService.getNextAppointment(req.SubjectId);
  if (nextAppointment) {
    res.status(httpStatus.OK).json({ nextAppointment });
  } else {
    res.status(httpStatus.NO_CONTENT).json({ nextAppointment: null });
  }
});
module.exports = {
  upcomingAppointments,
  getAppointmentsByType,
  showPrescriptions,
  showLabTestOrders,
  fetchHealthPackages,
  getDoctorsByCategories,
  getNextAppointment,
};
