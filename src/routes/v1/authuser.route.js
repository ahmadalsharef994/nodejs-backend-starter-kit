const express = require('express');
const validate = require('../../middlewares/validate');
const authUserValidation = require('../../validations/authUser.validation');
const authUserController = require('../../controllers/authuser.controller');
const authuser = require('../../middlewares/authUser');
const deviceauth = require('../../middlewares/deviceauth');

const router = express.Router();
/**
 * @openapi
 * /auth/user/create-user:
 *  post:
 *     tags:
 *     - user
 */
router.post('/create-user', deviceauth(), validate(authUserValidation.createUser), authUserController.createUser);
/**
 * @openapi
 * /auth/user/resend-create-user-otp:
 *  post:
 *     tags:
 *     - user
 */
router.post(
  '/resend-create-user-otp',
  deviceauth(),
  validate(authUserValidation.resendCreateUserOtp),
  authUserController.resendCreateUserOtp
);
/**
 * @openapi
 * /auth/user/verify-new-user:
 *  post:
 *     tags:
 *     - user
 */
router.post(
  '/verify-new-user',
  deviceauth(),
  validate(authUserValidation.verifyCreatedUser),
  authUserController.verifyCreatedUser
);
/**
 * @openapi
 * /auth/user/register:
 *  post:
 *     tags:
 *     - user
 */
router.post('/register', deviceauth(), validate(authUserValidation.registeruser), authUserController.register);
/**
 * @openapi
 * /auth/user/login:
 *  post:
 *     tags:
 *     - user
 */
router.post('/login', deviceauth(), validate(authUserValidation.login), authUserController.login);
/**
 * @openapi
 * /auth/user/login-with-google:
 *  post:
 *     tags:
 *     - user
 */
router.post('/login-with-google', authUserController.loginWithGoogle);
/**
 * @openapi
 * /auth/user/logout:
 *  post:
 *     tags:
 *     - user
 */
router.post('/logout', validate(authUserValidation.logout), authUserController.logout);
/**
 * @openapi
 * /auth/use/forgot-password':
 *  post:
 *     tags:
 *     - user
 */
router.post('/forgot-password', validate(authUserValidation.forgotPassword), authUserController.forgotPassword);
/**
 * @openapi
 * /auth/use/reset-password:
 *  post:
 *     tags:
 *     - user
 */
router.post('/reset-password', validate(authUserValidation.resetPassword), authUserController.resetPassword);
/**
 * @openapi
 * /auth/user/send-verification-email:
 *  post:
 *     tags:
 *     - user
 */
router.post('/send-verification-email', authuser(), authUserController.sendVerificationEmail);
/**
 * @openapi
 * /auth/user/verify-email:
 *  post:
 *     tags:
 *     - user
 */
router.post('/verify-email', authuser(), validate(authUserValidation.verifyEmail), authUserController.verifyEmail);
/**
 * @openapi
 * /auth/user/change-password:
 *  post:
 *     tags:
 *     - user
 */
router.post('/change-password', authuser(), validate(authUserValidation.changepassword), authUserController.changePassword);
/**
 * @openapi
 * /auth/user/request-otp:
 *  post:
 *     tags:
 *     - user
 */
router.post('/request-otp', authuser(), authUserController.requestOtp);
/**
 * @openapi
 * /auth/user/verify-phone:
 *  post:
 *     tags:
 *     - user
 */
router.post('/verify-phone', authuser(), validate(authUserValidation.verifyPhone), authUserController.verifyPhone);
/**
 * @openapi
 * /auth/user/resend-otp:
 *  post:
 *     tags:
 *     - user
 */
router.post('/resend-otp', authuser(), authUserController.resendOtp);

module.exports = router;
