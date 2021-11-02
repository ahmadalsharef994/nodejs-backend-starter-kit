const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const joinAppointmentDoctor = {
  body: Joi.object().keys({
    appointmentInit: Joi.objectId().required(),
  }),
};

module.exports = {
  joinAppointmentDoctor,
};
