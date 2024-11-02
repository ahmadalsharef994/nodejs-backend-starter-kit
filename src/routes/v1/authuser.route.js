const express = require('express');
const validate = require('../../middlewares/validate');
const authUserValidation = require('../../validations/authUser.validation');
const authUserController = require('../../controllers/authuser.controller');
const authuser = require('../../middlewares/authUser');
const deviceauth = require('../../middlewares/deviceauth');

const router = express.Router();

router.post('/create-user', deviceauth(), validate(authUserValidation.createUser), authUserController.createUser); // USED DON'T REMOVE

router.post(
  '/resend-create-user-otp',
  deviceauth(),
  validate(authUserValidation.resendCreateUserOtp),
  authUserController.resendCreateUserOtp
); // USED DON'T REMOVE

router.post(
  '/verify-new-user',
  deviceauth(),
  validate(authUserValidation.verifyCreatedUser),
  authUserController.verifyCreatedUser
); // USED DON'T REMOVE

router.post('/register', deviceauth(), validate(authUserValidation.registeruser), authUserController.register); // USED DON'T REMOVE
router.post('/login', deviceauth(), validate(authUserValidation.login), authUserController.login);
// router.post('/login-with-google', authUserController.loginWithGoogle);
router.post('/logout', validate(authUserValidation.logout), authUserController.logout);
router.post('/forgot-password', validate(authUserValidation.forgotPassword), authUserController.forgotPassword);
router.post('/reset-password', validate(authUserValidation.resetPassword), authUserController.resetPassword);
router.post('/change-password', authuser(), validate(authUserValidation.changepassword), authUserController.changePassword);

// router.post('/verify-otp', validate(authUserValidation.verifyOtp), authUserController.verifyOtp);
// router.post('/send-verification-email', authuser(), authUserController.sendVerificationEmail);
// router.post('/verify-email', authuser(), validate(authUserValidation.verifyEmail), authUserController.verifyEmail);
// router.post('/change-email', authuser(), authUserController.changeEmail);
// router.post('/change-phone', authuser(), authUserController.changePhone);
// router.post('/request-otp', authuser(), authUserController.requestOtp);
// router.post('/verify-phone', authuser(), validate(authUserValidation.verifyPhone), authUserController.verifyPhone);
// router.post('/resend-otp', authuser(), authUserController.resendOtp);

module.exports = router;
