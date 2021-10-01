const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { authService } = require('../services');

const getAuthdatas = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await authService.queryUsers(filter, options);
  res.status(httpStatus.OK).json(result);
});

const getAuthdata = catchAsync(async (req, res) => {
  const user = await authService.getAuthById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.OK).json(user);
});

module.exports = {
  getAuthdatas,
  getAuthdata,
};
