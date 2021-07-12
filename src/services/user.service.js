const httpStatus = require('http-status');
const { Auth } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await Auth.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const auth = await Auth.create(userBody);
  return auth;
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await Auth.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return Auth.findOne({ _id: id });
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return Auth.findOne({ email });
};
/**
 * Update user by id
 * @param {Model} user
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserPassByID = async (auth, updateBody) => {
  // eslint-disable-next-line no-param-reassign
  auth.password = updateBody;
  await auth.save();
  return Auth;
};
/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (authId, updateBody) => {
  const auth = await getUserById(authId);
  if (!auth) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await Auth.isEmailTaken(updateBody.email, authId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(auth, updateBody);
  await Auth.save();
  return auth;
};
/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (authId) => {
  const auth = await getUserById(authId);
  if (!auth) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await auth.remove();
  return auth;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  updateUserPassByID,
};
