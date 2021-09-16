const { appointmentPreferenceService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const submitAppointmentPreference = catchAsync(async (req, res) => {
  const result = await appointmentPreferenceService.createPreference(req.body, req.verifieddocid);
  res.status(201).json(result);
});

const updateAppointmentPreference = catchAsync(async (req, res) => {
  const result = await appointmentPreferenceService.updatePreference(req.body, req.verifieddocid);
  res.status(200).json(result);
});

const showfollowups = catchAsync(async (req, res) => {
  appointmentPreferenceService.getfollowups(req.verifieddocid).then((result) => {
    return res.status(200).json(result);
  });
});

const showappointments = catchAsync(async (req, res) => {
  appointmentPreferenceService.getappointments().then((result) => {
    return res.status(200).json(result);
  });
});

module.exports = {
  submitAppointmentPreference,
  updateAppointmentPreference,
  showfollowups,
  showappointments,
};
