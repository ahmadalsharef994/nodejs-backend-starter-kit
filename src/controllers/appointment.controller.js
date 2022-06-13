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

const joinAppointmentUser = catchAsync(async (req, res) => {
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
  const { id, orderId } = await appointmentService.submitAppointmentDetails(
    req.body.docId,
    AuthData,
    req.body.slotId,
    req.body.date,
    req.body.bookingType,
    req.body.issue,
    req.body.patientName,
    req.body.patientMobile,
    req.body.patientMail
  );
  res.status(httpStatus.OK).json({ AppointmentId: id, orderId });
});

const getAppointmentDetails = catchAsync(async (req, res) => {
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

const getFollowupsById = catchAsync(async (req, res) => {
  await appointmentService.getFollowupsById(req.query.limit).then((result) => {
    if (result.length === 0) {
      res.status(httpStatus.OK).json({ message: 'No Followups found linked to this Appointment', data: [] });
    } else {
      res.status(httpStatus.OK).json({ message: 'Success', data: result });
    }
  });
});

const getAvailableFollowUps = catchAsync(async (req, res) => {
  await appointmentService.getAvailableFollowUpSlots(req.Docid, req.body.date).then((result) => {
    if (result.length === 0) {
      res.status(httpStatus.OK).json({ message: 'No Available Followup Slots found.', data: [] });
    } else {
      res.status(httpStatus.OK).json({ message: 'Success', data: result });
    }
  });
});

const getAvailableAppointments = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId); // AuthDoctor: AuthData._id
  const result = await appointmentService.getAvailableAppointments(AuthData);
  return res.status(httpStatus.OK).json({ message: 'Success', data: result });
});

const getUpcomingAppointments = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  await appointmentService.getUpcomingAppointments(req.Docid, req.query.limit, options).then((result) => {
    if (result.length === 0) {
      res.status(httpStatus.OK).json({ message: 'No Upcoming Appointments', data: [] });
    } else {
      res.status(httpStatus.OK).json(result);
    }
  });
});

const getAppointmentsByType = catchAsync(async (req, res) => {
  const filter = { Type: req.query.type };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  appointmentService
    .getAppointmentsByType(req.Docid, filter, options)
    .then((result) => {
      return res.status(httpStatus.OK).send(result);
    })
    .catch((err) => {
      return res.status(httpStatus.BAD_REQUEST).send(err);
    });
});

const getappointmentDoctor = catchAsync(async (req, res) => {
  // getAppointment by ID
  const DoctorSession = await appointmentService.getappointmentDoctor(req.params.appointmentId);
  if (DoctorSession !== false) {
    res.status(httpStatus.CREATED).json({ DoctorSession });
  } else {
    res.status(httpStatus.OK).json({ message: 'No Appointment present with this id', data: [] });
  }
});

const createPrescription = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);

  const Prescription = await appointmentService.createPrescriptionDoc(req.body, req.params.appointmentId, AuthData);
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
  const patientData = await appointmentService.getPatientDetails(req.params.patientId, AuthData);
  if (patientData.length) {
    res.status(httpStatus.OK).json({
      'Patient Name': patientData[0],
      'Patient Basic Details': patientData[1],
      'Patient Contact Details': patientData[2],
      'Patient Recent Appointment': patientData[3],
      'Prescription ': patientData[4],
    });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Error in fetching Patient data' });
  }
});

const getPatients = catchAsync(async (req, res) => {
  const { page, limit, sortBy } = req.query;
  const AuthData = await authService.getAuthById(req.SubjectId);
  const patientsData = await appointmentService.getPatients(AuthData, page, limit, sortBy);
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

const cancelAppointment = catchAsync(async (req, res) => {
  await appointmentService
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

const rescheduleAppointment = catchAsync(async (req, res) => {
  const { appointmentId, slotId, date, startDateTime, endDateTime } = await req.body;
  await appointmentService
    .rescheduleAppointment(req.Docid, appointmentId, slotId, date, startDateTime, endDateTime)
    .then((result) => {
      if (result) {
        res.status(httpStatus.OK).json({ message: 'Success', data: result });
      } else {
        res.status(httpStatus.BAD_REQUEST).json({ message: "Appointment doesn't exist", data: [] });
      }
    });
});

const bookingConfirmation = catchAsync(async (req, res) => {
  const { status, bookingDetails, Message, appointmentId } = await appointmentService.bookingConfirmation(
    req.body.orderId,
    req.body.appointmentId
  );
  if (status === 'success') {
    res.status(httpStatus.OK).json({ status, bookingDetails, Message, appointmentId });
  } else {
    res.status(httpStatus.CONFLICT).json({ reason: 'orderId not matched ', Message, status });
  }
});

const cancelFollowup = catchAsync(async (req, res) => {
  const result = await appointmentService.cancelFollowup(req.body.followupId);
  if (result === true) {
    res.status(httpStatus.OK).json({ message: 'followup cancelled !' });
  } else {
    res.status(httpStatus.OK).json({ message: 'cant cancel followup check appointment id and try again !' });
  }
});

const rescheduleFollowup = catchAsync(async (req, res) => {
  const result = await appointmentService.rescheduleFollowup(req.body.followupId, req.body.slotId, req.body.date);
  if (result) {
    res.status(httpStatus.OK).json({ message: 'followup rescheduled', result });
  } else {
    res.status(httpStatus.BAD_GATEWAY).json({ message: 'cant reschedule followup' });
  }
});

const allAppointments = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const data = await appointmentService.allAppointments(req.Docid, options);
  if (data) {
    res.status(httpStatus.OK).json({ data });
  } else {
    res.status(httpStatus.BAD_GATEWAY).json({ message: 'cant fetch appointments' });
  }
});

module.exports = {
  initAppointmentDoctor,
  joinAppointmentDoctor,
  joinAppointmentUser,
  bookAppointment,
  assignFollowup,
  getFollowupsById,
  getAvailableFollowUps,
  getAvailableAppointments,
  getUpcomingAppointments,
  getAppointmentsByType,
  getappointmentDoctor,
  createPrescription,
  getPrescription,
  getPatientDetails,
  getPatients,
  doctorFeedback,
  userFeedback,
  getAppointmentDetails,
  cancelAppointment,
  rescheduleAppointment,
  bookingConfirmation,
  cancelFollowup,
  rescheduleFollowup,
  allAppointments,
};
