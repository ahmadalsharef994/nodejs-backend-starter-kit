// auth.controller.js
import httpStatus from "http-status";
import authService from "../services/auth.service.js";
import tokenService from "../services/token.service.js";
import otpService from "../services/otp.service.js";
import catchAsync from "../utils/catchAsync.js";

const register = catchAsync(async (req, res) => {
  const user = await authService.createUser(req.body);
  const token = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, token });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const token = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).send({ user, token });
});

const getProfile = catchAsync(async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  res.status(httpStatus.OK).send(user);
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await authService.getUserByEmail(email);
  if (user) {
    await otpService.createAndSendOTP(user.id, "resetPassword", email);
  }
  // Always respond OK to prevent email enumeration
  res
    .status(httpStatus.OK)
    .send({ message: "If that email exists, an OTP has been sent" });
});

const resetPassword = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await authService.getUserByEmail(email);
  if (!user) {
    return res
      .status(httpStatus.OK)
      .send({ message: "Password reset successfully" });
  }
  await otpService.verifyOTP(user.id, otp, "resetPassword");
  await authService.resetPassword(user.id, newPassword);
  res.status(httpStatus.OK).send({ message: "Password reset successfully" });
});

const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, oldPassword, newPassword);
  res.status(httpStatus.OK).send({ message: "Password changed successfully" });
});

const logout = catchAsync(async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (token) {
    await tokenService.logout(token).catch(() => {});
  }
  res.status(httpStatus.OK).send({ message: "Logged out successfully" });
});

export {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  logout,
};
