const express = require('express');
const validate = require('../../middlewares/validate');
const authUserValidation = require('../../validations/authUser.validation');
const authUserController = require('../../controllers/authuser.controller');
const authuser = require('../../middlewares/authUser');

const router = express.Router();

router.post('/register', validate(authUserValidation.registeruser), authUserController.register);
router.post('/login', validate(authUserValidation.login), authUserController.login);
router.post('/login-with-google', authUserController.loginWithGoogle);
router.post('/logout', validate(authUserValidation.logout), authUserController.logout);
router.post('/forgot-password', validate(authUserValidation.forgotPassword), authUserController.forgotPassword);
router.post('/reset-password', validate(authUserValidation.resetPassword), authUserController.resetPassword);
router.post('/send-verification-email', authuser(), authUserController.sendVerificationEmail);
router.post('/verify-email', authuser(), validate(authUserValidation.verifyEmail), authUserController.verifyEmail);
router.post('/change-password', authuser(), validate(authUserValidation.changepassword), authUserController.changePassword);
router.post('/request-otp', authuser(), authUserController.requestOtp);
router.post('/verify-phone', authuser(), validate(authUserValidation.verifyPhone), authUserController.verifyPhone);
router.post('/resend-otp', authuser(), authUserController.resendOtp);

module.exports = router;
