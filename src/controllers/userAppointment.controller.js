const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userAppointmentService } = require('../services');
const pick = require('../utils/pick');

const upcomingAppointments = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const result = await userAppointmentService.getNextAppointment(AuthData, req.query.limit);
  if (result.length === 0) {
    return res.status(httpStatus.OK).json({ message: 'No Upcoming Appointments', data: [] });
  }
  return res.status(httpStatus.OK).json(result);
});

const showAppointmentsByType = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const filter = { AuthUser: AuthData.id, Type: req.query.type };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userAppointmentService.getAppointmentsByType(filter, options);
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

module.exports = {
  upcomingAppointments,
  showAppointmentsByType,
  showPrescriptions,
  showLabTestOrders,
};
