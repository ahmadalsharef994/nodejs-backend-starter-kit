const Joi = require('joi');
const { password } = require('./custom.validation');

const verifydoctor = {
  body: Joi.object().keys({
    docid: Joi.string().required(),
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
  headers: Joi.object().keys({
    devicehash: Joi.string().required(),
    devicetype: Joi.string().valid('ios', 'android', 'web', 'others').required(),
    fcmtoken: Joi.string().required(),
  }),
};

const loginadmin = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
  headers: Joi.object().keys({
    devicehash: Joi.string().required(),
    devicetype: Joi.string().valid('ios', 'android', 'web', 'others').required(),
    fcmtoken: Joi.string().required(),
  }),
};

module.exports = {
  verifydoctor,
  registeradmin,
  loginadmin,
};
