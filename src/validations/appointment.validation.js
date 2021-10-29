const Joi = require('joi');

const joinAppointmentDoctor = {
  body: Joi.object().keys({
    appointmentInit: Joi.string().required(),
  }),
};

module.exports = {
  joinAppointmentDoctor,
};
