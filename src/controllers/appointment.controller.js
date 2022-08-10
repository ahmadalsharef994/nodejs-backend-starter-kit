const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, appointmentService, userProfile } = require('../services');
const pick = require('../utils/pick');

const joinAppointmentDoctor = catchAsync(async (req, res) => {
  const appointmentId = req.body.appointmentId;
  // new design. only pass appointmentId
  const DoctorSession = await appointmentService.joinAppointmentDoctor(appointmentId);
  res.status(httpStatus.CREATED).json(DoctorSession);
});

const joinAppointmentUser = catchAsync(async (req, res) => {
  const appointmentId = req.body.appointmentId;
  // new design. only pass appointmentId
  const UserSession = await appointmentService.joinAppointmentPatient(appointmentId);
  res.status(httpStatus.CREATED).json(UserSession);
});

const bookAppointment = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const { id, orderId } = await appointmentService.bookAppointment(
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
  const AppointmentSession = await appointmentService.getAppointmentById(req.params.appointmentId);
  const PatientBasic = await userProfile.fetchBasicDetails(AppointmentSession.AuthUser);
  if (AppointmentSession !== false) {
    res.status(httpStatus.CREATED).json({ PatientBasic, AppointmentSession });
  } else {
    res.status(httpStatus.OK).json({ message: 'No Appointment present with this id', data: [] });
  }
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
  await appointmentService.getAvailableFollowUps(req.Docid, req.body.date).then((result) => {
    if (result.length === 0) {
      res.status(httpStatus.OK).json({ message: 'No Available Followup Slots found.', data: [] });
    } else {
      res.status(httpStatus.OK).json({ message: 'Success', data: result });
    }
  });
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
  const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : new Date('2022/01/01'); // example: 2022/04/26 ==> 2022-04-25T18:30:00.000Z;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date('2030/01/01');
  appointmentService
    .getAppointmentsByType(req.Docid, fromDate, endDate, filter, options)
    .then((result) => {
      return res.status(httpStatus.OK).send(result);
    })
    .catch((err) => {
      return res.status(httpStatus.BAD_REQUEST).send(err);
    });
});

const getAppointmentsByStatus = catchAsync(async (req, res) => {
  const filter = { Type: req.query.status };
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

  const Prescription = await appointmentService.createPrescriptionDoc(req.body, req.params.appointmentId, AuthData);
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
    res.status(httpStatus.BAD_REQUEST).json({ message: 'No Patients Exits' });
  }
});

const getDoctorFeedback = catchAsync(async (req, res) => {
  const feedbackData = await appointmentService.getDoctorFeedback(req.body, req.params.appointmentId);
  if (feedbackData !== false) {
    res.status(httpStatus.CREATED).json({ feedbackData });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Unable to add your feedback ' });
  }
});

const getUserFeedback = catchAsync(async (req, res) => {
  const feedbackData = await appointmentService.getUserFeedback(req.body, req.params.appointmentId);
  if (feedbackData !== false) {
    res.status(httpStatus.CREATED).json({ feedbackData });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Unable to add your feedback ' });
  }
});

const cancelAppointment = catchAsync(async (req, res) => {
  const appointmentId = req.params.appointmentId;
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

const rescheduleAppointment = catchAsync(async (req, res) => {
  const { appointmentId, slotId, date, message, sendMailToUser } = await req.body;
  const { result, emailSent } = await appointmentService.rescheduleAppointment(
    req.Docid,
    appointmentId,
    slotId,
    date,
    message,
    sendMailToUser
  );
  if (result) {
    res.status(httpStatus.OK).json({ message: 'Appointment Rescheduled!', data: result, emailSent });
  } else {
    res.status(httpStatus.OK).json({ message: 'Failed to reschedule the Appointment', data: result, emailSent });
  }
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

// const rescheduleFollowup = catchAsync(async (req, res) => {
//   const result = await appointmentService.rescheduleFollowup(req.body.followupId, req.body.slotId, req.body.date);
//   if (result) {
//     res.status(httpStatus.OK).json({ message: 'followup rescheduled', result });
//   } else {
//     res.status(httpStatus.BAD_GATEWAY).json({ message: 'cant reschedule followup' });
//   }
// });

const allAppointments = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : new Date('2022/01/01'); // example: 2022/04/26 ==> 2022-04-25T18:30:00.000Z;
  const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date('2030/01/01');
  const data = await appointmentService.allAppointments(req.Docid, fromDate, endDate, options);
  if (data) {
    res.status(httpStatus.OK).json({ data });
  } else {
    res.status(httpStatus.BAD_GATEWAY).json({ message: 'cant fetch appointments' });
  }
});

const deleteSlot = catchAsync(async (req, res) => {
  const updatedslots = await appointmentService.deleteSlot(req.SubjectId, req.body.slotId);
  if (updatedslots) {
    res.status(httpStatus.OK).json({ message: 'success', updatedslots });
  } else {
    res.status(httpStatus.OK).json({ message: 'failed', updatedslots });
  }
});

const getNextAppointmentDoctor = catchAsync(async (req, res) => {
  const nextAppointment = await appointmentService.getNextAppointmentDoctor(req.Docid);
  if (nextAppointment) {
    res.status(httpStatus.OK).json({ nextAppointment });
  } else {
    res.status(httpStatus.NO_CONTENT).json({ nextAppointment: null });
  }
});

module.exports = {
  // initAppointmentDoctor,
  joinAppointmentDoctor,
  joinAppointmentUser,
  bookAppointment,
  // assignFollowup,
  getFollowupsById,
  getAvailableFollowUps,
  getAvailableAppointments,
  getUpcomingAppointments,
  getAppointmentsByType,
  getAppointmentById,
  createPrescription,
  getPrescription,
  getPatientDetails,
  getPatients,
  getDoctorFeedback,
  getUserFeedback,
  getAppointmentDetails,
  cancelAppointment,
  rescheduleAppointment,
  bookingConfirmation,
  cancelFollowup,
  // rescheduleFollowup,
  allAppointments,
  deleteSlot,
  getNextAppointmentDoctor,
  getAppointmentsByStatus,
};
