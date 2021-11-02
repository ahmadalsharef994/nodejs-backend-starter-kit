const Joi = require('joi');
const { objectId } = require('./custom.validation');

const initiateappointment = {
  body: Joi.object().keys({
    appointmentInit: Joi.string().required(),
  }),
};

const bookAppointmentDetails = {
  body: Joi.object()
    .keys({
      docId: Joi.number().required(),
      startTime: Joi.string().required(),
      endTime: Joi.string().required(),
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
      type: Joi.string().valid('UPCOMING', 'TODAY', 'REFERRED', 'CANCELLED', 'PAST', 'FOLLOWUP'),
    })
    .min(1)
    .max(1),
};

module.exports = {
  initiateappointment,
  bookAppointmentDetails,
  followupDetails,
  getFollowups,
  getAllAppointments,
};
