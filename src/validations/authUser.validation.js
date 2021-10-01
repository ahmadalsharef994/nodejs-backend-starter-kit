const Joi = require('joi');
const { password } = require('./custom.validation');

const registeruser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    fullname: Joi.string().required(),
    isdcode: Joi.required().valid('91', '1'),
    mobile: Joi.number().required(),
    role: Joi.valid('user'),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    authtoken: Joi.string().required(),
  }),
};

const changepassword = {
  body: Joi.object().keys({
    oldpassword: Joi.string().required(),
    newpassword: Joi.string().required(),
    newconfirmpassword: Joi.string().required().valid(Joi.ref('newpassword')),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    choice: Joi.string().required().valid('email', 'phone'),
    email: Joi.string().email().when('choice', { is: 'email', then: Joi.required() }),
    phone: Joi.number().when('choice', { is: 'phone', then: Joi.required() }),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    resetcode: Joi.number().required(),
    newpassword: Joi.string().required().custom(password),
    newconfirmpassword: Joi.string().required().valid(Joi.ref('newpassword')),
  }),
};

const verifyEmail = {
  body: Joi.object().keys({
    emailcode: Joi.string().required(),
  }),
};

const verifyPhone = {
  body: Joi.object().keys({
    otp: Joi.number().required(),
  }),
};

const verifyforget = {
  body: Joi.object().keys({
    otp: Joi.number().required(),
  }),
};

module.exports = {
  registeruser,
  login,
  logout,
  changepassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  verifyPhone,
  verifyforget,
};
