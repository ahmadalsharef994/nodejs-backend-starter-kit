
// auth.validation.js
import Joi from 'joi';
import { password } from './custom.validation.js';

const register = {
  body: Joi.object().keys({
    fullname: Joi.string().required(),
    email: Joi.string().required().email(),
    mobile: Joi.string().required(),
    password: Joi.string().required().custom(password),
    role: Joi.string().valid('user', 'doctor', 'admin').required(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    role: Joi.string().valid('user', 'doctor', 'admin').required(),
  }),
};

const changePassword = {
  body: Joi.object().keys({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required().custom(password),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.string().required(),
    newPassword: Joi.string().required().custom(password),
  }),
};

export {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
};
