const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, appointmentService, userProfile } = require('../services');
const pick = require('../utils/pick');
// const prescriptionUpload = require('../Microservices/generatePrescription.service');

const initAppointmentDoctor = catchAsync(async (req, res) => {
  const InitSession = await appointmentService.initiateappointmentSession(req.body.appointmentInit);
  res.status(httpStatus.CREATED).json(InitSession);
});

const joinAppointmentDoctor = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const DoctorSession = await appointmentService.JoinappointmentSessionbyDoctor(
    req.body.appointmentInit,
    AuthData,
    req.body.socketID
  );
  res.status(httpStatus.CREATED).json(DoctorSession);
});

const joinAppointmentPatient = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const UserSession = await appointmentService.JoinappointmentSessionbyPatient(
    req.body.appointmentInit,
    AuthData,
    req.body.socketID
  );
  res.status(httpStatus.CREATED).json(UserSession);
});

const bookAppointment = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await appointmentService
    .submitAppointmentDetails(
      req.body.docId,
      AuthData,
      req.body.slotId,
      req.body.date,
      req.body.status,
      req.body.bookingType,
      req.body.documents,
      req.body.description,
      req.body.issue,
      req.body.doctorAction,
      req.body.doctorReason,
      req.body.userAction,
      req.body.userReason,
      req.body.rescheduled,
      req.body.doctorRescheduleding,
      req.body.labTest
    )
    .then((result) => {
      return res.status(httpStatus.CREATED).json({ message: 'Hurray! Appointment Booked', data: result });
    });
});

const getappointmentDetails = catchAsync(async (req, res) => {
  const AppointmentSession = await appointmentService.getappointmentDoctor(req.params.appointmentId);
  const PatientBasic = await userProfile.fetchBasicDetails(AppointmentSession.AuthUser);
  if (AppointmentSession !== false) {
    res.status(httpStatus.CREATED).json({ PatientBasic, AppointmentSession });
  } else {
    res.status(httpStatus.OK).json({ message: 'No Appointment present with this id', data: [] });
  }
});

const assignFollowup = catchAsync(async (req, res) => {
  await appointmentService
    .submitFollowupDetails(
      req.params.appointmentId,
      req.Docid,
      req.body.slotId,
      req.body.date,
      req.body.documents,
      req.body.status
    )
    .then((result) => {
      return res.status(httpStatus.OK).json({ message: 'Followup Slot assigned', data: result });
    });
});

const showFollowUpsById = catchAsync(async (req, res) => {
  appointmentService.getFollowupsById(req.params.appointmentId).then((result) => {
    if (result.length === 0) {
      return res.status(httpStatus.OK).json({ message: 'No Followups found linked to this Appointment', data: [] });
    }
    return res.status(httpStatus.OK).json({ message: 'Success', data: result });
  });
});

const showAvailableFollowUps = catchAsync(async (req, res) => {
  appointmentService.getAvailableFollowUpSlots(req.Docid).then((result) => {
    if (result.length === 0) {
      return res.status(httpStatus.OK).json({ message: 'No Available Followup Slots found.', data: [] });
    }
    return res.status(httpStatus.OK).json({ message: 'Success', data: result });
  });
});

const showAvailableAppointments = catchAsync(async (req, res) => {
  appointmentService.getAvailableAppointmentSlots(req.body.docId).then((result) => {
    return res.status(httpStatus.OK).json({ message: 'Success', data: result });
  });
});

const showUpcomingAppointments = catchAsync(async (req, res) => {
  appointmentService.getUpcomingAppointments(req.Docid, req.query.limit).then((result) => {
    if (result.length === 0) {
      return res.status(httpStatus.OK).json({ message: 'No Upcoming Appointments', data: [] });
    }
    return res.status(httpStatus.OK).json(result);
  });
});

const showAppointmentsByType = catchAsync(async (req, res) => {
  const filter = { Type: req.query.type };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  await appointmentService.getAppointmentsByType(req.Docid, filter, options).then((result) => {
    if (result.length === 0) {
      return res.status(httpStatus.OK).json({ message: 'No Appointments to show', data: [] });
    }
    return res.status(httpStatus.OK).json(result);
  });
});

const getappointmentDoctor = catchAsync(async (req, res) => {
  const DoctorSession = await appointmentService.getappointmentDoctor(req.params.appointmentId);
  if (DoctorSession !== false) {
    res.status(httpStatus.CREATED).json({ DoctorSession });
  } else {
    res.status(httpStatus.OK).json({ message: 'No Appointment present with this id', data: [] });
  }
});

const createPrescription = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const Prescription = await appointmentService.createPrescriptionDoc(req.body, AuthData);
  if (Prescription !== false) {
    res.status(httpStatus.CREATED).json({ message: 'Prescription Generated Sucessfully', Prescription });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Unable to create prescription' });
  }
});

const getPrescription = catchAsync(async (req, res) => {
  const prescriptionData = await appointmentService.fetchPrescriptionDoc(req.params.prescriptionId);
  if (prescriptionData !== false) {
    res.status(httpStatus.CREATED).json({ prescriptionData });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'No Prescription present with this id' });
  }
});

const getPatientDetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const patientData = await appointmentService.fetchPatientDetails(req.params.patientId, AuthData);
  if (patientData.length) {
    res.status(httpStatus.OK).json({
      'Patient Name': patientData[0],
      'Patient Basic Details': patientData[1],
      'Patient Contact Details': patientData[2],
      /* Appointments: patientData[3], */
    });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Error in fetching Patient data' });
  }
});

const getAllPatientDetails = catchAsync(async (req, res) => {
  const { page, limit, sortBy } = req.query;
  const AuthData = await authService.getAuthById(req.SubjectId);
  const patientsData = await appointmentService.fetchAllPatientDetails(AuthData, page, limit, sortBy);
  if (patientsData !== false) {
    res.status(httpStatus.CREATED).json({
      Patients: patientsData[0],
      page: patientsData[1].page,
      limit: patientsData[1].limit,
      totalPages: patientsData[1].totalPages,
      totalResults: patientsData[1].total,
    });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'No Patients Exits' });
  }
});

const doctorFeedback = catchAsync(async (req, res) => {
  const feedbackData = await appointmentService.doctorFeedback(req.body, req.params.appointmentId);
  if (feedbackData !== false) {
    res.status(httpStatus.CREATED).json({ feedbackData });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Unable to add your feedback ' });
  }
});

const userFeedback = catchAsync(async (req, res) => {
  const feedbackData = await appointmentService.userFeedback(req.body, req.params.appointmentId);
  if (feedbackData !== false) {
    res.status(httpStatus.CREATED).json({ feedbackData });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Unable to add your feedback ' });
  }
});

const cancelBooking = catchAsync(async (req, res) => {
  appointmentService
    .cancelAppointment(req.body.appointmentId)
    .then((result) => {
      if (result) {
        return res.status(httpStatus.OK).json({ message: 'Success', data: result });
      }
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Appointment already in Cancelled state', data: [] });
    })
    .catch(() => {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Appointment Cancellation failed', data: [] });
    });
});

// not implemented
const rescheduleBooking = catchAsync(async (req, res) => {
  appointmentService
    .cancelAppointment(req.body.appointmentId)
    .then((result) => {
      if (result) {
        return res.status(httpStatus.OK).json({ message: 'Success', data: result });
      }
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Appointment already in Cancelled state', data: [] });
    })
    .catch(() => {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Appointment Cancellation failed', data: [] });
    });
});

module.exports = {
  initAppointmentDoctor,
  joinAppointmentDoctor,
  joinAppointmentPatient,
  bookAppointment,
  assignFollowup,
  showFollowUpsById,
  showAvailableFollowUps,
  showAvailableAppointments,
  showUpcomingAppointments,
  showAppointmentsByType,
  getappointmentDoctor,
  createPrescription,
  getPrescription,
  getPatientDetails,
  getAllPatientDetails,
  doctorFeedback,
  userFeedback,
  getappointmentDetails,
  cancelBooking,
  rescheduleBooking,
};
