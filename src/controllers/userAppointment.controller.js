const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userAppointmentService, appointmentService } = require('../services');
const pick = require('../utils/pick');

const upcomingAppointments = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date('2030/01/01');
  const result = await userAppointmentService.getUpcomingAppointment(req.SubjectId, endDate, options);
  if (result.length === 0) {
    return res.status(httpStatus.OK).json({ message: 'No Upcoming Appointments', data: [] });
  }
  return res.status(httpStatus.OK).json(result);
});

const getAppointmentsByType = catchAsync(async (req, res) => {
  const filter = req.query.type;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : new Date('2022/01/01'); // example: 2022/04/26 ==> 2022-04-25T18:30:00.000Z;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date('2030/01/01');
  const result = await userAppointmentService.getAppointmentsByType(req.SubjectId, fromDate, endDate, filter, options);
  if (result.length === 0) {
    return res.status(httpStatus.OK).json({ message: 'No Appointments to show', data: [] });
  }
  return res.status(httpStatus.OK).json(result);
});

const getAppointmentsByStatus = catchAsync(async (req, res) => {
  const filter = { Status: req.query.status };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : new Date('2022/01/01'); // example: 2022/04/26 ==> 2022-04-25T18:30:00.000Z;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date('2030/01/01');
  userAppointmentService
    .getAppointmentsByStatus(req.SubjectId, fromDate, endDate, filter, options)
    .then((result) => {
      return res.status(httpStatus.OK).send(result);
    })
    .catch((err) => {
      return res.status(httpStatus.BAD_REQUEST).send(err);
    });
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

// const showLabTestOrders = catchAsync(async (req, res) => {
//   const AuthData = await authService.getAuthById(req.SubjectId);
//   const filter = { Type: req.query.type };
//   const options = pick(req.query, ['sortBy', 'limit', 'page']);
//   const result = await userAppointmentService.getAllLabTestOrders(AuthData, filter, options);
//   if (result.length === 0) {
//     return res.status(httpStatus.OK).json({ message: 'No Lab Test Orders to show', data: [] });
//   }
//   return res.status(httpStatus.OK).json(result);
// });

// const fetchHealthPackages = catchAsync(async (req, res) => {
//   const healthpackage = await userAppointmentService.fetchHealthPackages();
//   if (healthpackage) {
//     res.status(httpStatus.OK).json(healthpackage);
//   } else {
//     res.status(httpStatus[400]).json({ message: 'something went wrong' });
//   }
// });
const getDoctorsByCategories = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const filter = pick(req.query, [
    'FromExperience',
    'ToExperience',
    'Availability',
    'Languages',
    'Gender',
    'StartPrice',
    'EndPrice',
  ]);
  const response = await appointmentService.getDoctorsByCategories(req.body.Category, filter, options);
  res.send(response);
});
const getNextAppointment = catchAsync(async (req, res) => {
  const nextAppointment = await userAppointmentService.getNextAppointment(req.SubjectId);
  // eslint-disable-next-line eqeqeq
  if (nextAppointment != null || nextAppointment != undefined) {
    res.status(httpStatus.OK).json({ nextAppointment });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Appointments not found' });
  }
});
const getSlots = catchAsync(async (req, res) => {
  const date = new Date(req.body.Date).toDateString();
  const data = await userAppointmentService.getSlots(req.SubjectId, date);
  res.status(httpStatus.OK).json({ message: 'Success', data });
});
module.exports = {
  upcomingAppointments,
  getAppointmentsByType,
  showPrescriptions,
  // showLabTestOrders,
  // fetchHealthPackages,
  getDoctorsByCategories,
  getNextAppointment,
  getAppointmentsByStatus,
  getSlots,
};
