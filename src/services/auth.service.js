import httpStatus from 'http-status';
import { User } from '../models/index.js';
import ApiError from '../utils/ApiError.js';

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  if (await User.isPhoneTaken(userBody.phone)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone already taken');
  }
  return User.create(userBody);
};

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  if (!user.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is deactivated');
  }
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();
  
  return user;
};

/**
 * Login with phone and password
 * @param {string} phone
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithPhoneAndPassword = async (phone, password) => {
  const user = await getUserByPhone(phone);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect phone or password');
  }
  if (!user.isActive) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Account is deactivated');
  }
  
  // Update last login
  user.lastLogin = new Date();
  await user.save();
  
  return user;
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Get user by phone
 * @param {string} phone
 * @returns {Promise<User>}
 */
const getUserByPhone = async (phone) => {
  return User.findOne({ phone });
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  if (updateBody.phone && (await User.isPhoneTaken(updateBody.phone, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Change user password
 * @param {ObjectId} userId
 * @param {string} oldPassword
 * @param {string} newPassword
 * @returns {Promise<User>}
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (!(await user.isPasswordMatch(oldPassword))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect old password');
  }
  user.password = newPassword;
  await user.save();
  return user;
};

/**
 * Reset user password
 * @param {ObjectId} userId
 * @param {string} newPassword
 * @returns {Promise<User>}
 */
const resetPassword = async (userId, newPassword) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  user.password = newPassword;
  await user.save();
  return user;
};

/**
 * Verify user email
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const verifyEmail = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  user.isEmailVerified = true;
  await user.save();
  return user;
};

/**
 * Verify user phone
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const verifyPhone = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  user.isPhoneVerified = true;
  await user.save();
  return user;
};

export {
  createUser,
  loginUserWithEmailAndPassword,
  loginUserWithPhoneAndPassword,
  getUserByEmail,
  getUserByPhone,
  getUserById,
  updateUserById,
  changePassword,
  resetPassword,
  verifyEmail,
  verifyPhone,
};
