const express = require('express');
const validate = require('../../middlewares/validate');
const authDoctorValidation = require('../../validations/authDoctor.validation');
const authDoctorController = require('../../controllers/authdoctor.controller');
const OnboardingAuth = require('../../middlewares/authDoctor');
const deviceauth = require('../../middlewares/deviceauth');

const router = express.Router();

router.post('/register', deviceauth(), validate(authDoctorValidation.register), authDoctorController.register);
router.post('/login', deviceauth(), validate(authDoctorValidation.login), authDoctorController.login);
router.post('/logout', validate(authDoctorValidation.logout), authDoctorController.logout); // Thinking to make it GET and Validated
router.post('/forgot-password', validate(authDoctorValidation.forgotPassword), authDoctorController.forgotPassword);
// router.post('/reset-password', validate(authDoctorValidation.resetPassword), authDoctorController.resetPassword);
router.post('/verify-otp', validate(authDoctorValidation.verifyOtp), authDoctorController.verifyOtp);
router.post('/reset-password', validate(authDoctorValidation.resetPassword), authDoctorController.resetPassowrd);
router.post('/send-verification-email', OnboardingAuth(), authDoctorController.sendVerificationEmail);
router.post('/change-email', OnboardingAuth(), authDoctorController.changeEmail);
router.post('/change-phone', OnboardingAuth(), authDoctorController.changePhone);
router.post('/verify-email', OnboardingAuth(), validate(authDoctorValidation.verifyEmail), authDoctorController.verifyEmail);
router.post(
  '/change-password',
  OnboardingAuth(),
  validate(authDoctorValidation.changepassword),
  authDoctorController.changePassword
);
router.post('/request-otp', OnboardingAuth(), authDoctorController.requestOtp);
router.post('/verify-phone', OnboardingAuth(), validate(authDoctorValidation.verifyPhone), authDoctorController.verifyPhone);
router.post('/resend-otp', OnboardingAuth(), authDoctorController.resendOtp);

module.exports = router;
