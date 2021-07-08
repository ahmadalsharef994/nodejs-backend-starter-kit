const express = require('express');
const validate = require('../../middlewares/validate');
const authUserValidation = require('../../validations/authUser.validation');
const authUserController = require('../../controllers/authuser.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post('/register', validate(authUserValidation.registeruser), authUserController.register);
router.post('/login', validate(authUserValidation.login), authUserController.login);
router.post('/logout', validate(authUserValidation.logout), authUserController.logout);
router.post('/forgot-password', validate(authUserValidation.forgotPassword), authUserController.forgotPassword);
router.post('/reset-password', validate(authUserValidation.resetPassword), authUserController.resetPassword);
router.post('/send-verification-email', auth(), authUserController.sendVerificationEmail);
router.post('/verify-email', validate(authUserValidation.verifyEmail), authUserController.verifyEmail);
router.post('/change-password', validate(authUserValidation.changepassword), authUserController.changePassword);
router.post('/request-otp', auth(), authUserController.requestOtp);
router.post('/verify-phone', auth(), validate(authUserValidation.verifyPhone), authUserController.verifyPhone);
router.post('/resend-otp', auth(), authUserController.resendOtp);

module.exports = router;