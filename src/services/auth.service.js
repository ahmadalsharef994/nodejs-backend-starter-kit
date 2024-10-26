
// auth.service.js
const httpStatus = require('http-status');
const { Auth } = require('../models');
const ApiError = require('../utils/ApiError');
const tokenService = require('./token.service');
const otpServices = require('./otp.service');

const register = async (authData) => {
  if (await Auth.isEmailTaken(authData.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  if (await Auth.isPhoneTaken(authData.mobile)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number already taken');
  }
  const auth = await Auth.create(authData);
  return auth;
};

const loginWithEmailAndPassword = async (email, password, role) => {
  const auth = await Auth.findOne({ email, role });
  if (!auth || !(await auth.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return auth;
};

const getAuthById = async (id) => {
  return Auth.findById(id);
};

const changeAuthPassword = async ({ oldPassword, newPassword }, userId) => {
  const auth = await getAuthById(userId);
  if (!(await auth.isPasswordMatch(oldPassword))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect old password');
  }
  auth.password = newPassword;
  await auth.save();
};

module.exports = {
  register,
  loginWithEmailAndPassword,
  getAuthById,
  changeAuthPassword,
};
