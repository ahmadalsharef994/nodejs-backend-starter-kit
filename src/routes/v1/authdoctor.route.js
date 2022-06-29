const express = require('express');
const validate = require('../../middlewares/validate');
const authDoctorValidation = require('../../validations/authDoctor.validation');
const authDoctorController = require('../../controllers/authdoctor.controller');
const OnboardingAuth = require('../../middlewares/authDoctor');
const deviceauth = require('../../middlewares/deviceauth');

const router = express.Router();

// REPLACE OnboardingAuth
// router.get('/onboarding-status', OnboardingAuth(), authDoctorController.onboardingstatus); Not in use

/**
 * @openapi
 * /auth/doctor/register:
 *  post:
 *     tags:
 *     - doctor
 */
router.post('/register', deviceauth(), validate(authDoctorValidation.registerdoctor), authDoctorController.register);
/**
 * @openapi
 * /auth/doctor/login:
 *  post:
 *     tags:
 *     - doctor
 */
router.post('/login', deviceauth(), validate(authDoctorValidation.login), authDoctorController.login);
/**
 * @openapi
 * /auth/doctor/logout:
 *  post:
 *     tags:
 *     - doctor
 */
router.post('/logout', validate(authDoctorValidation.logout), authDoctorController.logout); // Thinking to make it GET and Validated
/**
 * @openapi
 * /auth/doctor/forgot-password:
 *  post:
 *     tags:
 *     - doctor
 */
router.post('/forgot-password', validate(authDoctorValidation.forgotPassword), authDoctorController.forgotPassword);
/**
 * @openapi
 * /auth/doctor/reset-password:
 *  post:
 *     tags:
 *     - doctor
 */
router.post('/reset-password', validate(authDoctorValidation.resetPassword), authDoctorController.resetPassword);
/**
 * @openapi
 * /auth/doctor/send-verification-email:
 *  post:
 *     tags:
 *     - doctor
 */
router.post('/send-verification-email', OnboardingAuth(), authDoctorController.sendVerificationEmail);
/**
 * @openapi
 * /auth/doctor/change-email:
 *  post:
 *     tags:
 *     - doctor
 */
router.post('/change-email', OnboardingAuth(), authDoctorController.changeEmail);
/**
 * @openapi
 * /auth/doctor/change-phone:
 *  post:
 *     tags:
 *     - doctor
 */
router.post('/change-phone', OnboardingAuth(), authDoctorController.changePhone);
/**
 * @openapi
 * /auth/doctor/verify-email:
 *  post:
 *     tags:
 *     - doctor
 */
router.post('/verify-email', OnboardingAuth(), validate(authDoctorValidation.verifyEmail), authDoctorController.verifyEmail);
/**
 * @openapi
 * /auth/doctor/change-password:
 *  post:
 *     tags:
 *     - doctor
 */
router.post(
  '/change-password',
  OnboardingAuth(),
  validate(authDoctorValidation.changepassword),
  authDoctorController.changePassword
);
/**
 * @openapi
 * /auth/doctor/request-otp:
 *  post:
 *     tags:
 *     - doctor
 */
router.post('/request-otp', OnboardingAuth(), authDoctorController.requestOtp);
/**
 * @openapi
 * /auth/doctor/verify-phone:
 *  post:
 *     tags:
 *     - doctor
 */
router.post('/verify-phone', OnboardingAuth(), validate(authDoctorValidation.verifyPhone), authDoctorController.verifyPhone);
/**
 * @openapi
 * /auth/doctor/resend-otp:
 *  post:
 *     tags:
 *     - doctor
 */
router.post('/resend-otp', OnboardingAuth(), authDoctorController.resendOtp);

// router.get('/checkverification', OnboardingAuth(), authDoctorController.tryverification); //Checking Verification States
// It is breaking NMC Portal be Cautious

module.exports = router;
