const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const getTokenSubID = require('../utils/GetToken');
const otpServices = require('./otp.service');

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

const changeUserPassword = async (oldPassword, newPassword, token) => {
  const userSubID = await getTokenSubID(token);
  const userdocs = await userService.getUserById(userSubID);
  if (!userdocs || !(await userdocs.isPasswordMatch(oldPassword))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password InCorrect');
  }
  await userService.updateUserPassByID(userdocs, newPassword);
  await tokenService.logoutdevice(token);
  return userdocs;
};

/**
 * Reset password
 * @param {string} email
 * @param {string} resetcode
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (email, resetcode, newPassword) => {
  const AuthData = await userService.getUserByEmail(email);
  const verification = await otpServices.verifyForgetPasswordOtp(resetcode, AuthData);
  if(verification){
    await userService.updateUserById(AuthData._id, { password: newPassword });
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  resetPassword,
  verifyEmail,
  changeUserPassword,
};
