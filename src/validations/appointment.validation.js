const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { objectId } = require('./custom.validation');

const joinAppointmentDoctor = {
  body: Joi.object().keys({
    appointmentInit: Joi.string().required(),
    socketID: Joi.string().required(),
  }),
};
const deleteSlot = {
  body: Joi.object().keys({
    slotId: Joi.string().required(),
  }),
};
const joinAppointmentUser = {
  body: Joi.object().keys({
    appointmentInit: Joi.objectId().required(),
    socketID: Joi.string().required(),
  }),
};

const bookAppointment = {
  body: Joi.object()
    .keys({
      docId: Joi.number().required(),
      slotId: Joi.string().required(),
      date: Joi.string().required(),
      status: Joi.string(), // valid options needed
      bookingType: Joi.string().required().valid('TODAY', 'REFERRED', 'CANCELLED', 'SCHEDULED'),
      documents: Joi.array(),
      description: Joi.string(),
      issue: Joi.string().required(),
      doctorAction: Joi.string(),
      doctorReason: Joi.string(),
      userAction: Joi.string(),
      userReason: Joi.string(),
      rescheduled: Joi.boolean(),
      doctorRescheduleding: Joi.string(),
      labTest: Joi.array(),
      patientName: Joi.string().required(),
      patientMobile: Joi.number().required(),
      patientMail: Joi.string().required(),
    })
    .min(8)
    .max(15),
};

const assignFollowup = {
  params: Joi.object()
    .keys({
      appointmentId: Joi.string().custom(objectId),
    })
    .min(1)
    .max(1),
  body: Joi.object()
    .keys({
      slotId: Joi.string().required(),
      date: Joi.string().required(),
      documents: Joi.string().required(),
      status: Joi.string().required(),
    })
    .min(4)
    .max(4),
};

const getFollowups = {
  params: Joi.object()
    .keys({
      appointmentId: Joi.string(),
      limit: Joi.string(),
    })
    .min(1)
    .max(1),
};

const getAppointmentsByType = {
  query: Joi.object()
    .keys({
      type: Joi.string().valid('TODAY', 'REFERRED', 'CANCELLED', 'PAST', 'ALL', 'FOLLOWUP'),
      limit: Joi.number(),
      page: Joi.number(),
      sortBy: Joi.string(),
    })
    .min(0)
    .max(4),
};

const getAppointmentDetails = {
  params: Joi.object().keys({
    appointmentId: Joi.string().custom(objectId),
  }),
};

const createPrescription = {
  body: Joi.object().keys({
    Medicines: Joi.array().required(),
    LabTest: Joi.string().required(),
    OtherInstructions: Joi.string().required(),
  }),
};

const getPrescription = {
  params: Joi.object().keys({
    appointmentId: Joi.string().custom(objectId),
    prescriptionId: Joi.string().custom(objectId),
  }),
};

const getPatientDetails = {
  params: Joi.object().keys({
    patientId: Joi.string().custom(objectId),
  }),
};

const getUserFeedback = {
  params: Joi.object().keys({
    appointmentId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    doctorRating: Joi.number().required(),
    doctorDescription: Joi.string().required(),
  }),
};

const getDoctorFeedback = {
  params: Joi.object().keys({
    appointmentId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userRating: Joi.number().required(),
    userDescription: Joi.string().required(),
  }),
};

// const getAvailableAppointments = {
//   body: Joi.object().keys({
//     docId: Joi.required(),
//   }),
// };

const cancelAppointment = {
  body: Joi.object()
    .keys({
      appointmentId: Joi.string().custom(objectId),
    })
    .min(1)
    .max(1),
};

const cancelFollowup = {
  body: Joi.object().keys({
    followupId: Joi.string().custom(objectId),
  }),
};

const rescheduleAppointment = {
  body: Joi.object()
    .keys({
      appointmentId: Joi.string().custom(objectId),
      slotId: Joi.string(),
      date: Joi.string(),
      startDateTime: Joi.string(),
      endDateTime: Joi.string(),
    })
    .min(3)
    .max(3),
};
const getDoctorsByCategories = {
  body: Joi.object().keys({
    Category: Joi.string().required(),
  }),
};
const bookingConfirmation = {
  body: Joi.object().keys({
    orderId: Joi.string().required(),
    appointmentId: Joi.string().required(),
  }),
};
const rescheduleFollowup = {
  body: Joi.object().keys({
    followupId: Joi.string().custom(objectId).required(),
    date: Joi.string().required(),
    slotId: Joi.string().required(),
  }),
};
module.exports = {
  joinAppointmentDoctor,
  joinAppointmentUser,
  bookAppointment,
  assignFollowup,
  getFollowups,
  getAppointmentsByType,
  // getAvailableAppointments,
  getAppointmentDetails,
  createPrescription,
  getPrescription,
  getPatientDetails,
  getUserFeedback,
  getDoctorFeedback,
  cancelAppointment,
  rescheduleAppointment,
  getDoctorsByCategories,
  bookingConfirmation,
  cancelFollowup,
  rescheduleFollowup,
  deleteSlot,
};
