const Joi = require('joi');
const { objectId } = require('./custom.validation');  // Ensuring we use the custom validation for MongoDB IDs

const createUser = {
  body: Joi.object().keys({
    isdcode: Joi.string().required(),
    mobile: Joi.string().pattern(/^\d+$/).required(),
  }),
};

const resendCreateUserOtp = {
  body: Joi.object().keys({
    mobile: Joi.string().pattern(/^\d+$/).required(),
  }),
};

const verifyCreatedUser = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    otp: Joi.number().integer().min(100000).max(999999).required(),
  }),
};

const registeruser = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(30).required(),
    fullname: Joi.string().required(),
    role: Joi.string().valid('user').required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    dob: Joi.date().required(),
    pincode: Joi.number().integer().min(100000).max(999999).required(),
  }),
};

const login = {
  body: Joi.object().keys({
    username: Joi.string().required(),
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
  createUser,
  resendCreateUserOtp,
  verifyCreatedUser,
  registeruser,
  login,
  logout,
  changepassword,
  forgotPassword,
  resetPassword,
};
