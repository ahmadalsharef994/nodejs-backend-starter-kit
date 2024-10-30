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
// create user auth data
const register = async (AuthData) => {
  if (await Auth.isEmailTaken(AuthData.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email Already Taken');
  }
  if (await Auth.isPhoneTaken(AuthData.mobile)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Phone Number Already Taken');
  }
  const auth = await Auth.create(AuthData);
  return auth;
};

// const createGoogleAuthData = async (profileBody) => {
//   try {
//     const user = await Auth.findOne({ googleId: profileBody.id });
//     if (user) {
//       throw new ApiError(httpStatus.BAD_REQUEST, 'Email Already Taken');
//     } else {
//       // if user is not preset in our database save user data to database.
//       const auth = await Auth.create(profileBody);
//       return auth;
//     }
//   } catch (err) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Google AUth Data Error');
//   }
// };

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
  const userAuth = await Auth.findOne({ _id: id });
  if (!userAuth) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return userAuth;
};

/**
 * Get Auth by email
 * @param {string} email
 * @returns {Promise<Auth>}
 */
// to find if email already exists
const getAuthByEmail = async (email) => {
  return Auth.findOne({ email });
};

/**
 * Get Auth by Phone
 * @param {string} phone
 * @returns {Promise<Auth>}
 */
// to find if phone number already exists
const getAuthByPhone = async (phone) => {
  return Auth.findOne({ mobile: phone });
};
/**
 * Update Auth by id
 * @param {Model} Auth
 * @param {Object} updateBody
 * @returns {Promise<Auth>}
 */
const updatePassword = async (AuthData, newPassword) => {
  AuthData.password = newPassword;
  await AuthData.save();
  return AuthData;
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
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Auth>}
 */
// login for doctor
const loginWithEmailAndPassword = async (email, password) => {
  const auth = await getAuthByEmail(email);

  if (!auth) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'not found');
  }
  // if (doctor) {
  //   if (`${doctor.role[0]}` !== 'doctor') {
  //     throw new ApiError(httpStatus.UNAUTHORIZED, 'Doctor not found');
  //   }
  // }
  if (!auth || !(await auth.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return auth;
};
// login admin
// const loginWithEmailAndPassword = async (username, password) => {
//   const user = await getAuthByEmail(username);
//   if (!user || `${user.role[0]}` !== 'admin') {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
//   }
//   if (!user || !(await user.isPasswordMatch(password))) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
//   }
//   return user;
// };
// // login for user
// const loginWithEmailAndPassword = async (username, password) => {
//   let user = await getAuthByEmail(username);
//   if (!user) {
//     user = await getAuthByPhone(username);
//     if (!user || `${user.role[0]}` !== 'user') {
//       throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
//     }
//   }
//   if (user) {
//     if (`${user.role[0]}` !== 'user') {
//       throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
//     }
//   }
//   if (!user || !(await user.isPasswordMatch(password))) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
//   }
//   return user;
// };
// change password
const changeAuthPassword = async (oldPassword, newPassword, token, SubjectId) => {
  const userdocs = await getAuthById(SubjectId);
  if (!userdocs || !(await userdocs.isPasswordMatch(oldPassword))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password InCorrect');
  }
  await updatePassword(userdocs, newPassword);
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
const verifyOtp = async (email, resetcode) => {
  const AuthData = await getAuthByEmail(email);
  const verification = await otpServices.verifyForgetPasswordOtp(resetcode, AuthData);
  // if (verification) {
  //   await updateAuthById(AuthData._id, { password: newPassword });
  // }
  return verification;
};
const resetPassword = async (AuthData, newPassword, confirmPassword) => {
  let response;
  if (newPassword === confirmPassword) {
    response = await updateAuthById(AuthData._id, { password: newPassword });
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, "passwords doesn't match");
  }
  return response;
};
module.exports = {
  register,
  queryAuthData,
  // createGoogleAuthData,
  getAuthById,
  getAuthByEmail,
  getAuthByPhone,
  updateAuthById,
  deleteAuthById,
  updatePassword,
  loginWithEmailAndPassword,
  // loginWithEmailAndPassword,
  // loginWithEmailAndPassword,
  resetPassword,
  verifyOtp,
  changeAuthPassword,
};