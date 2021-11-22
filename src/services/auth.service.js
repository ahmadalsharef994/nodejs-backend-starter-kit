const httpStatus = require('http-status');
const { Auth } = require('../models');
const ApiError = require('../utils/ApiError');
const tokenService = require('./token.service');
const otpServices = require('./otp.service');

/**
 * Create a AuthData
 * @param {Object} AuthBody
 * @returns {Promise<Auth>}
 */
const createAuthData = async (authBody) => {
  if (await Auth.isEmailTaken(authBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email Already Taken');
  }
  if (await Auth.isPhoneTaken(authBody.mobile)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone Number Already Taken');
  }
  const auth = await Auth.create(authBody);
  return auth;
};

const createGoogleAuthData = async (profileBody) => {
  try {
    let user = await Auth.findOne({ googleId: profile.id })
    if (user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email Already Taken');
    } else {
      // if user is not preset in our database save user data to database.
      const auth = await Auth.create(profileBody);
      return auth;
    }
  } catch (err) {
  }
};

/**
 * Query for authusers
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryAuthData = async (filter, options) => {
  const authdata = await Auth.paginate(filter, options);
  return authdata;
};

/**
 * Get Auth by id
 * @param {ObjectId} id
 * @returns {Promise<Auth>}
 */
const getAuthById = async (id) => {
  return Auth.findOne({ _id: id });
};

/**
 * Get Auth by email
 * @param {string} email
 * @returns {Promise<Auth>}
 */
const getAuthByEmail = async (email) => {
  return Auth.findOne({ email });
};

/**
 * Get Auth by Phone
 * @param {string} phone
 * @returns {Promise<Auth>}
 */
const getAuthByPhone = async (phone) => {
  return Auth.findOne({ phone });
};
/**
 * Update Auth by id
 * @param {Model} Auth
 * @param {Object} updateBody
 * @returns {Promise<Auth>}
 */
// eslint-disable-next-line no-shadow
const updateAuthPassByID = async (Auth, updateBody) => {
  // eslint-disable-next-line no-param-reassign
  Auth.password = updateBody;
  await Auth.save();
  return Auth;
};
/**
 * Update Auth by id
 * @param {ObjectId} AuthId
 * @param {Object} updateBody
 * @returns {Promise<Auth>}
 */
const updateAuthById = async (authId, updateBody) => {
  const auth = await getAuthById(authId);
  if (!auth) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Auth not found');
  }
  if (updateBody.email && (await Auth.isEmailTaken(updateBody.email, authId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(auth, updateBody);
  await auth.save();
  return auth;
};
/**
 * Delete Auth by id
 * @param {ObjectId} AuthId
 * @returns {Promise<Auth>}
 */
const deleteAuthById = async (authId) => {
  const auth = await getAuthById(authId);
  if (!auth) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Auth not found');
  }
  await auth.remove();
  return auth;
};

/**
 * Login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Auth>}
 */
const loginAuthWithEmailAndPassword = async (email, password) => {
  const user = await getAuthByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return user;
};

const changeAuthPassword = async (oldPassword, newPassword, token, SubjectId) => {
  const userdocs = await getAuthById(SubjectId);
  if (!userdocs || !(await userdocs.isPasswordMatch(oldPassword))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password InCorrect');
  }
  await updateAuthPassByID(userdocs, newPassword);
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
  const AuthData = await getAuthByEmail(email);
  const verification = await otpServices.verifyForgetPasswordOtp(resetcode, AuthData);
  if (verification) {
    await updateAuthById(AuthData._id, { password: newPassword });
  }
};

module.exports = {
  createAuthData,
  queryAuthData,
  createGoogleAuthData,
  getAuthById,
  getAuthByEmail,
  getAuthByPhone,
  updateAuthById,
  deleteAuthById,
  updateAuthPassByID,
  loginAuthWithEmailAndPassword,
  resetPassword,
  changeAuthPassword,
};
