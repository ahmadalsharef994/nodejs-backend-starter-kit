const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const initiateappointment = {
  body: Joi.object().keys({
    appointmentInit: Joi.string().required(),
  }),
};

const getappointment = {
  params: Joi.object().keys({
    appointmentId: Joi.objectId().required(),
  }),
};

const createprescription = {
  body: Joi.object().keys({
    appointmentInit: Joi.string().required(),
  }),
};

const getprescription = {
  params: Joi.object().keys({
    appointmentId: Joi.objectId().required(),
  }),
};

module.exports = {
  initiateappointment,
  getappointment,
  createprescription,
  getprescription,
};
