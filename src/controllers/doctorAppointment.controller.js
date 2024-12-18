const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { appointmentPreferenceService, authService, appointmentService } = require('../services');
const dyteService = require('../Microservices/dyteServices');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');

const joinAppointmentDoctor = catchAsync(async (req, res) => {
  const appointmentId = req.body.appointmentId;
  const dyteSession = await dyteService.getDyteSessionByAppointmentId(appointmentId);
  if (!dyteSession) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Meeting Room Found for this appointment');
  }
  res.status(httpStatus.CREATED).json({ roomName: dyteSession.roomName, authToken: dyteSession.doctorToken });
});

const joinAppointmentUser = catchAsync(async (req, res) => {
  const appointmentId = req.body.appointmentId;
  const dyteSession = await dyteService.getDyteSessionByAppointmentId(appointmentId);
  if (!dyteSession) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Meeting Room Found for this appointment');
  }
  res.status(httpStatus.CREATED).json({ roomName: dyteSession.roomName, authToken: dyteSession.userToken });
});

const bookAppointment = catchAsync(async (req, res) => {
  // const AuthData = await authService.getAuthById(req.SubjectId);
  const { id, orderId } = await appointmentService.bookAppointment(
    req.body.docId,
    req.SubjectId,
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

const getAvailableAppointments = catchAsync(async (req, res) => {
  const result = await appointmentService.getAvailableAppointments(req.SubjectId);
  return res.status(httpStatus.OK).json({ message: 'Success', data: result });
});

const getUpcomingAppointments = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : new Date(); // example: 2022/04/26 ==> 2022-04-25T18:30:00.000Z;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date('2030/01/01');
  await appointmentService.getUpcomingAppointments(req.Docid, fromDate, endDate, options).then((result) => {
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
  const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : new Date('2022/01/01');
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date('2030/01/01');

  const result = await appointmentService.getAppointmentsByType(req.Docid, fromDate, endDate, filter, options);
  return res.status(httpStatus.OK).send(result);
});

const getAppointmentsByStatus = catchAsync(async (req, res) => {
  const filter = { Status: req.query.status };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : new Date('2022/01/01'); // example: 2022/04/26 ==> 2022-04-25T18:30:00.000Z;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date('2030/01/01');
  appointmentService
    .getAppointmentsByStatus(req.Docid, fromDate, endDate, filter, options)
    .then((result) => {
      return res.status(httpStatus.OK).send(result);
    })
    .catch((err) => {
      return res.status(httpStatus.BAD_REQUEST).send(err);
    });
});

const getAppointmentById = catchAsync(async (req, res) => {
  const DoctorSession = await appointmentService.getAppointmentById(req.params.appointmentId);
  if (DoctorSession !== false) {
    res.status(httpStatus.CREATED).json({ DoctorSession });
  } else {
    res.status(httpStatus.OK).json({ message: 'No Appointment present with this id', data: [] });
  }
});

const createPrescription = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);

  const Prescription = await appointmentService.createPrescription(req.body, req.params.appointmentId, AuthData);
  if (Prescription !== false) {
    res.status(httpStatus.CREATED).json({ message: 'Prescription Generated Sucessfully', Prescription });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Unable to create prescription' });
  }
});

const getPrescription = catchAsync(async (req, res) => {
  const prescriptionData = await appointmentService.getPrescription(req.params.prescriptionId);
  if (prescriptionData !== false) {
    res.status(httpStatus.CREATED).json({ prescriptionData });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'No Prescription present with this id' });
  }
});

const getPatientDetails = catchAsync(async (req, res) => {
  const doctorId = req.SubjectId;
  const patientId = req.params.patientId;
  const patientData = await appointmentService.getPatientDetails(patientId, doctorId);
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
    res.status(httpStatus.NO_CONTENT).json({ message: 'No Patients Exits' });
  }
});

const getNextAppointmentDoctor = catchAsync(async (req, res) => {
  const nextAppointment = await appointmentService.getNextAppointmentDoctor(req.Docid);
  if (nextAppointment) {
    res.status(httpStatus.OK).json({ nextAppointment });
  } else {
    res.status(httpStatus.NO_CONTENT).json({ nextAppointment: 'No appointments found' });
  }
});

const cancelAppointment = catchAsync(async (req, res) => {
  const appointmentId = req.body.appointmentId;
  const doctorId = req.SubjectId;
  await appointmentService
    .cancelAppointment(appointmentId, doctorId)
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

const updateAppointmentPreference = catchAsync(async (req, res) => {
  const doctorAuthId = req.SubjectId;
  const docId = req.Docid;
  const isPriceSet = await appointmentPreferenceService.checkForAppointmentPrice(doctorAuthId);
  if (!isPriceSet) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'General Appointment Price Not Set' });
  }
  const preferences = req.body;

  const result = await appointmentPreferenceService.updateAppointmentPreference(preferences, doctorAuthId, docId);

  if (result === null) {
    res.status(httpStatus.NO_CONTENT).json({ message: "Slots doesn't exist. Create slots inorder to update them!" });
  } else {
    res.status(httpStatus.OK).json({ message: 'slots updated', result });
  }
});

const getAppointmentPreferences = catchAsync(async (req, res) => {
  const doctorId = await authService.getAuthById(req.SubjectId);
  appointmentPreferenceService
    .getAppointmentPreferences(doctorId)
    .then((result) => {
      if (result === null) {
        return res.status(httpStatus.NO_CONTENT).json({ message: "Appointment slots doesn't exist." });
      }
      return res.status(httpStatus.OK).json(result);
    })
    .catch(() => {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Something went wrong with getAppointments service');
    });
});

module.exports = {
  // initAppointmentDoctor,
  joinAppointmentDoctor,
  joinAppointmentUser,
  bookAppointment,
  // assignFollowup,
  // getFollowupsById,
  // getAvailableFollowUps,
  getAvailableAppointments,
  getUpcomingAppointments,
  getAppointmentsByType,
  getAppointmentById,
  createPrescription,
  getPrescription,
  getPatientDetails,
  getPatients,
  // getDoctorFeedback,
  // getUserFeedback,
  // getAppointmentDetails,
  cancelAppointment,
  // rescheduleAppointment,
  // bookingConfirmation,
  // cancelFollowup,
  // rescheduleFollowup,
  // allAppointments,
  // deleteSlot,
  getNextAppointmentDoctor,
  getAppointmentsByStatus,
  getAppointmentPreferences,
  updateAppointmentPreference,
};
