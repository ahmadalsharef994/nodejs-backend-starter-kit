const httpStatus = require('http-status');
const { appointmentPreferenceService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const submitAppointmentPreference = catchAsync(async (req, res) => {
  const result = await appointmentPreferenceService.createPreference(req.body, req.verifieddocid);
  return res.status(httpStatus.CREATED).json(result);
});

const updateAppointmentPreference = catchAsync(async (req, res) => {
  const result = await appointmentPreferenceService.updatePreference(req.body, req.verifieddocid);
  if (result === null) {
    return res.status(httpStatus.NOT_FOUND).json("Slots doesn't exist. Create slots inorder to update them!");
  }
  return res.status(httpStatus.OK).json(result);
});

const showfollowups = catchAsync(async (req, res) => {
  appointmentPreferenceService.getfollowups(req.verifieddocid).then((result) => {
    if (result === null) {
      return res.status(httpStatus.NOT_FOUND).json("Follow up slots doesn't exist.");
    }
    return res.status(httpStatus.OK).json(result);
  });
});

const showappointments = catchAsync(async (req, res) => {
  appointmentPreferenceService.getappointments(req.body.verifieddocid).then((result) => {
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
