const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    mobile: Joi.number().required().min(1000000000).max(9999999999),
  }),
};

const resendCreateUserOtp = {
  body: Joi.object().keys({
    mobile: Joi.number().required().min(1000000000).max(9999999999),
  }),
};

const verifyCreatedUser = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    otp: Joi.number().required().min(100000).max(999999),
  }),
};

const registeruser = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    fullname: Joi.string().required(),
    role: Joi.valid('user'),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    dob: Joi.date().required(),
    pincode: Joi.number().required().min(100000).max(999999),
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
    newPassword: Joi.string().required(),
    confirmNewPassword: Joi.string().required().valid(Joi.ref('newPassword')),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    choice: Joi.string().required().valid('email', 'phone'),
    email: Joi.string().email().when('choice', { is: 'email', then: Joi.required() }),
    phone: Joi.number().when('choice', { is: 'phone', then: Joi.required() }).min(1000000000).max(9999999999),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    choice: Joi.string().required().valid('email', 'phone'),
    email: Joi.string().email().when('choice', { is: 'email', then: Joi.required() }),
    phone: Joi.number().when('choice', { is: 'phone', then: Joi.required() }).min(1000000000).max(9999999999),
    resetcode: Joi.number().required(),
    newPassword: Joi.string().required().custom(password),
    confirmNewPassword: Joi.string().required().valid(Joi.ref('newPassword')),
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
  createUser,
  resendCreateUserOtp,
  verifyCreatedUser,
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
