import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import config from "../config/config.js";
import { getUserById, getUserByEmail } from "./auth.service.js";
import { Token } from "../models/index.js";
import ApiError from "../utils/ApiError.js";

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(expires.getTime() / 1000),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires,
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  let payload;
  try {
    payload = jwt.verify(token, config.jwt.secret);
  } catch {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
  }
  const tokenDoc = await Token.findOne({
    token,
    type,
    user: payload.sub,
    blacklisted: false,
  });
  if (!tokenDoc) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Token not found");
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
  const now = Date.now();
  const accessTokenExpires = new Date(
    now + config.jwt.accessExpirationMinutes * 60 * 1000,
  );
  const accessToken = generateToken(user.id, accessTokenExpires, "access");

  const refreshTokenExpires = new Date(
    now + config.jwt.refreshExpirationDays * 24 * 60 * 60 * 1000,
  );
  const refreshToken = generateToken(user.id, refreshTokenExpires, "refresh");
  await saveToken(refreshToken, user.id, refreshTokenExpires, "refresh");

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires,
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires,
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "No users found with this email");
  }
  const expires = new Date(
    Date.now() + config.jwt.resetPasswordExpirationMinutes * 60 * 1000,
  );
  const resetPasswordToken = generateToken(user.id, expires, "resetPassword");
  await saveToken(resetPasswordToken, user.id, expires, "resetPassword");
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user) => {
  const expires = new Date(
    Date.now() + config.jwt.verifyEmailExpirationMinutes * 60 * 1000,
  );
  const verifyEmailToken = generateToken(user.id, expires, "verifyEmail");
  await saveToken(verifyEmailToken, user.id, expires, "verifyEmail");
  return verifyEmailToken;
};

/**
 * Generate verify phone token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyPhoneToken = async (user) => {
  const expires = new Date(
    Date.now() + config.jwt.verifyEmailExpirationMinutes * 60 * 1000,
  );
  const verifyPhoneToken = generateToken(user.id, expires, "verifyPhone");
  await saveToken(verifyPhoneToken, user.id, expires, "verifyPhone");
  return verifyPhoneToken;
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await verifyToken(refreshToken, "refresh");
    const user = await getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.deleteOne();
    return generateAuthTokens(user);
  } catch {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  }
};

/**
 * Logout by deleting the refresh token
 * @param {string} refreshToken
 * @returns {Promise<void>}
 */
const logout = async (refreshToken) => {
  const tokenDoc = await Token.findOne({
    token: refreshToken,
    type: "refresh",
    blacklisted: false,
  });
  if (!tokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Token not found");
  }
  await tokenDoc.deleteOne();
};

export default {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  generateVerifyPhoneToken,
  refreshAuth,
  logout,
};
