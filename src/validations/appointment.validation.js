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
    })
    .min(3)
    .max(3),
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
    })
    .min(2)
    .max(2),
};

const getFollowups = {
  params: Joi.object()
    .keys({
      appointmentId: Joi.string().custom(objectId),
    })
    .min(1)
    .max(1),
};

const getAllAppointments = {
  query: Joi.object()
    .keys({
      type: Joi.string().valid('UPCOMING', 'TODAY', 'REFERRED', 'CANCELLED', 'PAST', 'FOLLOWUP'),
    })
    .min(1)
    .max(1),
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

module.exports = {
  joinAppointmentDoctor,
  joinAppointmentUser,
  bookAppointmentDetails,
  assignfollowupDetails,
  getFollowups,
  getAllAppointments,
  getappointment,
  createprescription,
  getprescription,
  getDetailsPatient,
  userFeedback,
  doctorFeedback,
};
