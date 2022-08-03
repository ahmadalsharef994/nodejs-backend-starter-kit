const httpStatus = require('http-status');
const { appointmentPreferenceService, authService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const updateAppointmentPreference = catchAsync(async (req, res) => {
  const doctorAuthId = req.SubjectId;
  const docId = req.Docid;
  const isPriceSet = await appointmentPreferenceService.checkForAppointmentPrice(doctorAuthId);
  if (!isPriceSet) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'General Appointment Price Not Set');
  }
  const preferences = req.body;
  // const AppointmentPreferenceExists = await appointmentPreferenceService.checkAppointmentPreference(
  //   req.Docid,
  //   req.SubjectId
  // );
  // if (AppointmentPreferenceExists === true) {
  const result = await appointmentPreferenceService.updateAppointmentPreference(preferences, doctorAuthId, docId);

  if (result === null) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Slots doesn't exist. Create slots inorder to update them!" });
  } else {
    res.status(httpStatus.OK).json({ message: 'slots updated', result });
  }
});
// const showFollowups = catchAsync(async (req, res) => {
//   appointmentPreferenceService
//     .getFollowups(req.Docid)
//     .then((result) => {
//       if (result === null) {
//         return res.status(httpStatus.NOT_FOUND).json({ message: "Follow up slots doesn't exist." });
//       }
//       return res.status(httpStatus.OK).json(result);
//     })
//     .catch(() => {
//       throw new ApiError(httpStatus.BAD_REQUEST, 'Something went wrong with getFollwups service');
//     });
// });

const getAppointmentPreferences = catchAsync(async (req, res) => {
  const doctorId = await authService.getAuthById(req.SubjectId);
  appointmentPreferenceService
    .getAppointmentPreferences(doctorId)
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
  // showFollowups,
  getAppointmentPreferences,
};
