const Joi = require('joi');
const { password } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().min(8).max(30).required(),
    fullname: Joi.string().required(),
    isdcode: Joi.required(),
    mobile: Joi.number().required(),
    role: Joi.valid('doctor').required(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
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
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(8, 'utf8').required(),
    confirmNewPassword: Joi.string().min(8, 'utf8').required().valid(Joi.ref('newPassword')),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    choice: Joi.string().required().valid('email', 'phone'),
    email: Joi.string().email().when('choice', { is: 'email', then: Joi.required() }),
    phone: Joi.number().when('choice', { is: 'phone', then: Joi.required() }),
  }),
};

const verifyOtp = {
  body: Joi.object().keys({
    choice: Joi.string().required().valid('email', 'phone'),
    email: Joi.string().email().when('choice', { is: 'email', then: Joi.required() }),
    phone: Joi.number().when('choice', { is: 'phone', then: Joi.required() }),
    resetcode: Joi.number().required(),
  }),
};
const resetPassword = {
  body: Joi.object().keys({
    choice: Joi.string().required().valid('email', 'phone'),
    email: Joi.string().email().when('choice', { is: 'email', then: Joi.required() }),
    phone: Joi.number().when('choice', { is: 'phone', then: Joi.required() }),
    newPassword: Joi.string().required().custom(password),
    confirmNewPassword: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  body: Joi.object().keys({
    emailcode: Joi.number().required(),
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
  register,
  login,
  logout,
  changepassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  verifyPhone,
  verifyforget,
  verifyOtp,
};
