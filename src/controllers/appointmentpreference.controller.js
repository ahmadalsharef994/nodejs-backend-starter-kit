const httpStatus = require('http-status');
const { appointmentPreferenceService, authService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const updateAppointmentPreference = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const isPriceSet = await appointmentPreferenceService.checkForAppointmentPrice(AuthData);
  if (!isPriceSet) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'General Appointment Price Not Set');
  }
  const AppointmentPreferenceExists = await appointmentPreferenceService.checkAppointmentPreference(
    req.Docid,
    req.SubjectId
  );
  if (AppointmentPreferenceExists === true) {
    const result = await appointmentPreferenceService.updatePreference(req.body, req.Docid, AuthData);
    if (result === null) {
      res.status(httpStatus.NOT_FOUND).json({ message: "Slots doesn't exist. Create slots inorder to update them!" });
    } else {
      res.status(httpStatus.OK).json({ message: 'slots updated', result });
    }
  } else {
    const result = await appointmentPreferenceService.createPreference(req.body, req.Docid, AuthData);
    if (!result) {
      res.status(httpStatus.NOT_FOUND).json({ message: 'Error Submitting Appointment Preference' });
    }
    res.status(httpStatus.CREATED).json({ message: 'slots created', result });
  }
});
const showfollowups = catchAsync(async (req, res) => {
  appointmentPreferenceService
    .getfollowups(req.Docid)
    .then((result) => {
      if (result === null) {
        return res.status(httpStatus.NOT_FOUND).json({ message: "Follow up slots doesn't exist." });
      }
      return res.status(httpStatus.OK).json(result);
    })
    .catch(() => {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Something went wrong with getFollwups service');
    });
});

const showappointments = catchAsync(async (req, res) => {
  appointmentPreferenceService
    .getappointments(req.Docid)
    .then((result) => {
      if (result === null) {
        return res.status(httpStatus.NOT_FOUND).json({ message: "Appointment slots doesn't exist." });
      }
      return res.status(httpStatus.OK).json(result);
    })
    .catch(() => {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Something went wrong with getAppointments service');
    });
});

module.exports = {
  updateAppointmentPreference,
  showfollowups,
  showappointments,
};
