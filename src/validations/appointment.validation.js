const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { objectId } = require('./custom.validation');

const joinAppointmentDoctor = {
  body: Joi.object().keys({
    appointmentInit: Joi.objectId().required(),
    socketID: Joi.string().required(),
  }),
};
const joinAppointmentUser = {
  body: Joi.object().keys({
    appointmentInit: Joi.objectId().required(),
    socketID: Joi.string().required(),
  }),
};

const bookAppointmentDetails = {
  body: Joi.object()
    .keys({
      docId: Joi.number().required(),
      slotId: Joi.string().required(),
      date: Joi.string().required(),
      status: Joi.string().required(), // valid options needed
      bookingType: Joi.string().required().valid('TODAY', 'REFERRED', 'CANCELLED', 'PAST'),
      documents: Joi.array(),
      description: Joi.string().required(),
      issue: Joi.string().required(),
      doctorAction: Joi.string(),
      doctorReason: Joi.string(),
      userAction: Joi.string(),
      userReason: Joi.string(),
      rescheduled: Joi.boolean(),
      doctorRescheduleding: Joi.string(),
      labTest: Joi.array(),
    })
    .min(7)
    .max(15),
};

const assignfollowupDetails = {
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
      appointmentId: Joi.string().custom(objectId),
    })
    .min(1)
    .max(1),
};

const getAppointmentsByType = {
  query: Joi.object()
    .keys({
      type: Joi.string().valid('TODAY', 'REFERRED', 'CANCELLED', 'PAST', 'ALL'),
      limit: Joi.number(),
      page: Joi.number(),
      sortBy: Joi.string(),
    })
    .min(0)
    .max(4),
};

const getappointment = {
  params: Joi.object().keys({
    appointmentId: Joi.string().custom(objectId),
  }),
};

const createprescription = {
  body: Joi.object().keys({
    Medicines: Joi.array().required(),
    LabTest: Joi.string().required(),
    OtherInstructions: Joi.string().required(),
  }),
};

const getprescription = {
  params: Joi.object().keys({
    appointmentId: Joi.string().custom(objectId),
    prescriptionId: Joi.string().custom(objectId),
  }),
};

const getDetailsPatient = {
  params: Joi.object().keys({
    patientId: Joi.string().custom(objectId),
  }),
};

const userFeedback = {
  params: Joi.object().keys({
    appointmentId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    doctorRating: Joi.number().required(),
    doctorDescription: Joi.string().required(),
  }),
};

const doctorFeedback = {
  params: Joi.object().keys({
    appointmentId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    userRating: Joi.number().required(),
    userDescription: Joi.string().required(),
  }),
};

const getAvailableAppointmentSlots = {
  body: Joi.object().keys({
    docId: Joi.number().integer().required().min(10000000).max(99999999),
  }),
};

const cancelAppointment = {
  body: Joi.object()
    .keys({
      appointmentId: Joi.string().custom(objectId),
    })
    .min(1)
    .max(1),
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

module.exports = {
  joinAppointmentDoctor,
  joinAppointmentUser,
  bookAppointmentDetails,
  assignfollowupDetails,
  getFollowups,
  getAppointmentsByType,
  getAvailableAppointmentSlots,
  getappointment,
  createprescription,
  getprescription,
  getDetailsPatient,
  userFeedback,
  doctorFeedback,
  cancelAppointment,
  rescheduleAppointment,
};
