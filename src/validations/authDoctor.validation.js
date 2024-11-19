const Joi = require('joi');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().min(8).max(30).required(),
    fullname: Joi.string().required(),
    isdcode: Joi.string().required(),  // adjusted as a string for flexibility with codes
    mobile: Joi.string().pattern(/^\d+$/).required(), // ensures numeric mobile
    role: Joi.string().valid('doctor').required(),
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
    newPassword: Joi.string().min(8).max(30).required(),
    confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    choice: Joi.string().valid('email', 'phone').required(),
    email: Joi.string().email().when('choice', { is: 'email', then: Joi.required() }),
    phone: Joi.string().pattern(/^\d+$/).when('choice', { is: 'phone', then: Joi.required() }),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    choice: Joi.string().valid('email', 'phone').required(),
    email: Joi.string().email().when('choice', { is: 'email', then: Joi.required() }),
    phone: Joi.string().pattern(/^\d+$/).when('choice', { is: 'phone', then: Joi.required() }),
    newPassword: Joi.string().min(8).max(30).required(),
    confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
  }),
};

module.exports = {
  register,
  login,
  logout,
  changepassword,
  forgotPassword,
  resetPassword,
};
