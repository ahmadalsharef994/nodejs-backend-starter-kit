const Joi = require('joi');
const { password } = require('./custom.validation');

const registerdoctor = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    fullname: Joi.string().required(),
    isdcode: Joi.required().valid('91', '1'),
    mobile: Joi.number().required(),
    role: Joi.valid('doctor'),
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

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  body: Joi.object().keys({
    otp: Joi.number().required(),
  }),
};

const requestOtp = {
  body: Joi.object().keys({
    phonenumber: Joi.number().required(),
  }),
};

const verifyPhone = {
  body: Joi.object().keys({
    otp: Joi.number().required(),
  }),
};

const resendOtp = {
  body: Joi.object().keys({
    phonenumber: Joi.number().required(),
  }),
};

const verifyforget = {
  body: Joi.object().keys({
    otp: Joi.number().required(),
  }),
};

module.exports = {
  registerdoctor,
  login,
  logout,
  changepassword,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendOtp,
  verifyPhone,
  requestOtp,
  verifyforget
};
