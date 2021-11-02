const Joi = require('joi');
const { password } = require('./custom.validation');

const verifydoctor = {
  body: Joi.object().keys({
    docid: Joi.string().required(),
  }),
};

const rejectdoctor = {
  body: Joi.object().keys({
    docid: Joi.string().required(),
    basicDetails: Joi.boolean().required(),
    educationDetails: Joi.boolean().required(),
    experienceDetails: Joi.boolean().required(),
    payoutdetails: Joi.boolean().required(),
    rejectionMsg: Joi.array()
      .items(
        Joi.string().valid(
          'BSC01',
          'BSC02',
          'BSC03',
          'BSC04',
          'BSC05',
          'BSC06',
          'BSC07',
          'EDU01',
          'EDU02',
          'EDU03',
          'EXP01',
          'EXP02',
          'EXP03',
          'PAY01',
          'PAY02'
        )
      )
      .required(),
    customMsg: Joi.string(),
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

module.exports = {
  verifydoctor,
  rejectdoctor,
  registeradmin,
  loginadmin,
};
