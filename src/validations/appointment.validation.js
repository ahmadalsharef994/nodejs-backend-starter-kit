const Joi = require('joi');
const { objectId } = require('./custom.validation');

const joinAppointmentDoctor = {
  body: Joi.object().keys({
    appointmentInit: Joi.string().custom(objectId),
  }),
};
const joinAppointmentUser = {
  body: Joi.object().keys({
    appointmentInit: Joi.string().custom(objectId),
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

const followupDetails = {
  params: Joi.object()
    .keys({
      appointmentId: Joi.string().custom(objectId),
    })
    .min(1)
    .max(1),
  body: Joi.object()
    .keys({
      startTime: Joi.string().required(),
      endTime: Joi.string().required(),
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
      type: Joi.string().valid('SCHEDULED', 'TODAY', 'REFERRED', 'CANCELLED', 'PAST', 'FOLLOWUP'),
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

module.exports = {
  joinAppointmentDoctor,
  joinAppointmentUser,
  bookAppointmentDetails,
  followupDetails,
  getFollowups,
  getAllAppointments,
  getappointment,
  createprescription,
  getprescription,
};
