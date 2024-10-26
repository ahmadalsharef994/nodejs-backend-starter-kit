const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, tokenService } = require('../services');
const ApiError = require('../utils/ApiError');

const register = catchAsync(async (req, res) => {
  const AuthData = await authService.register(req.body);
  const authtoken = await tokenService.generateDoctorToken(AuthData.id);
  res.status(httpStatus.CREATED).json({ AuthData, authtoken });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const AuthData = await authService.loginWithEmailAndPassword(email, password);
  const authtoken = await tokenService.generateDoctorToken(AuthData.id);
  res.status(httpStatus.OK).json({ AuthData, authtoken });
});

const logout = catchAsync(async (req, res) => {
  await tokenService.logoutdevice(req.body.authtoken);
  res.status(httpStatus.OK).json({ message: 'Logged out successfully' });
});

const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  await authService.changeAuthPassword(oldPassword, newPassword, req.body.authtoken, req.SubjectId);
  res.status(httpStatus.OK).json({ message: 'Password changed successfully' });
});

const forgotPassword = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthByEmail(req.body.email);
  if (!AuthData) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No account is registered with this email');
  }
  res.status(httpStatus.OK).json({ message: 'Password reset instructions sent' });
});

const resetPassword = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthByEmail(req.body.email);
  if (!AuthData) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No account is registered with this email');
  }
  await authService.resetPassword(AuthData, req.body.newPassword, req.body.confirmNewPassword);
  res.status(httpStatus.OK).json({ message: 'Password reset successfully' });
});

module.exports = {
  register,
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
};
