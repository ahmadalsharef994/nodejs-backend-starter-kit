const Joi = require('joi');

const initiateappointment = {
  body: Joi.object().keys({
    appointmentInit: Joi.string().required(),
  }),
};

module.exports = {
  initiateappointment,
};
