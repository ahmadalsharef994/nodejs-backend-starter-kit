const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, appointmentService, userProfile } = require('../services');
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

// same method as appointment booking to be implemented
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

const showFollowups = catchAsync(async (req, res) => {
  appointmentService.getFollowups(req.params.appointmentId).then((result) => {
    if (result.length === 0) {
      return res.status(httpStatus.OK).json({ message: 'No Followups assigned.', data: [] });
    }
    return res.status(httpStatus.OK).json({ message: 'success', data: result });
  });
});

const showUpcomingAppointments = catchAsync(async (req, res) => {
  appointmentService.getUpcomingAppointments(req.Docid).then((result) => {
    if (result.length === 0) {
      return res.status(httpStatus.OK).json({ message: 'No Upcoming Appointments', data: [] });
    }
    return res.status(httpStatus.OK).json(result);
  });
});

const showAllAppointments = catchAsync(async (req, res) => {
  appointmentService.getAllAppointments(req.Docid, req.query.type).then((result) => {
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
  const patientAppointmentData = await appointmentService.fetchPatientDetails(req.params.patientId, AuthData);
  const PatientBasic = await userProfile.fetchBasicDetails(AuthData);
  if (patientAppointmentData !== false && PatientBasic !== false) {
    res
      .status(httpStatus.CREATED)
      .json({ 'Patient Basic Details': PatientBasic, 'Pateint Appoinment Details': patientAppointmentData });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'No Patient present with this id' });
  }
});

const getAllPatientDetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const patientsData = await appointmentService.fetchAllPatientDetails(AuthData);
  if (patientsData !== false) {
    res.status(httpStatus.CREATED).json({ patientsData });
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

module.exports = {
  initAppointmentDoctor,
  joinAppointmentDoctor,
  joinAppointmentPatient,
  bookAppointment,
  assignFollowup,
  showFollowups,
  showUpcomingAppointments,
  showAllAppointments,
  getappointmentDoctor,
  createPrescription,
  getPrescription,
  getPatientDetails,
  getAllPatientDetails,
  doctorFeedback,
  userFeedback,
  getappointmentDetails,
};
