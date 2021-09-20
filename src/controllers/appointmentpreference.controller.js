const httpStatus = require('http-status');
const { appointmentPreferenceService, authService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const submitAppointmentPreference = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const result = await appointmentPreferenceService.createPreference(req.body, req.Docid, AuthData);
  return res.status(httpStatus.CREATED).json(result);
});

const updateAppointmentPreference = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const result = await appointmentPreferenceService.updatePreference(req.body, req.Docid, AuthData);
  if (result === null) {
    return res.status(httpStatus.NOT_FOUND).json("Slots doesn't exist. Create slots inorder to update them!");
  }
  return res.status(httpStatus.OK).json(result);
});

const showfollowups = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  appointmentPreferenceService.getfollowups(req.Docid, AuthData).then((result) => {
    if (result === null) {
      return res.status(httpStatus.NOT_FOUND).json("Follow up slots doesn't exist.");
    }
    return res.status(httpStatus.OK).json(result);
  });
});

const showappointments = catchAsync(async (req, res) => {
  appointmentPreferenceService.getappointments(req.body.Docid, req.body.AuthData).then((result) => {
    if (result === null) {
      return res.status(httpStatus.NOT_FOUND).json("Appointment slots doesn't exist.");
    }
    return res.status(httpStatus.OK).json(result);
  });
});

module.exports = {
  submitAppointmentPreference,
  updateAppointmentPreference,
  showfollowups,
  showappointments,
};
