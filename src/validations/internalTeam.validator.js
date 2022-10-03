const Joi = require('joi');
const { password } = require('./custom.validation');

const verifydoctor = {
  body: Joi.object().keys({
    docid: Joi.string().required(),
  }),
};

const setServiceCharges = {
  body: Joi.object().keys({
    docid: Joi.string().required(), // what is docid
    serviceCharges: Joi.number().min(0.1).max(0.3),
  }),
};

const rejectdoctor = {
  body: Joi.object().keys({
    docid: Joi.string().required(),
    basicDetails: Joi.boolean().required(),
    educationDetails: Joi.boolean().required(),
    experienceDetails: Joi.boolean().required(),
    payoutdetails: Joi.boolean().required(),
    rejectionMsg: Joi.string().required(),
  }),
};

const registeradmin = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    fullname: Joi.string().required(),
    isdcode: Joi.required().valid('91', '1'),
    mobile: Joi.number().required(),
    role: Joi.valid('admin').required(),
  }),
};

const loginadmin = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const doctordetails = {
  body: Joi.object().keys({
    specializations: Joi.array().required(),
    doctorname: Joi.string().required(),
    doctorauthId: Joi.string().required(),
    Experience: Joi.number().required(),
    doctorDegree: Joi.string().required(),
    doctorClinicAddress: Joi.string().required(),
    appointmentPrice: Joi.number().default(600),
    doctorId: Joi.number().required(),
    Gender: Joi.string(),
    Languages: Joi.array(),
  }),
};

module.exports = {
  verifydoctor,
  rejectdoctor,
  registeradmin,
  loginadmin,
  doctordetails,
  setServiceCharges,
};
