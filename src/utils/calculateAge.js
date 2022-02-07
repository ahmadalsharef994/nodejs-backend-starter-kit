const httpStatus = require('http-status');
const ApiError = require('./ApiError');

const calculateAge = (dob) => {
  try {
    const today = new Date();
    const age = today.getUTCFullYear() - dob.getUTCFullYear();
    return age;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Age calculation failed');
  }
};

module.exports = calculateAge;
