const express = require('express');
const validate = require('../../middlewares/validate');
const authDoctorValidation = require('../../validations/authDoctor.validation');
const authDoctorController = require('../../controllers/authdoctor.controller');
const authdoctornonverified = require('../../middlewares/authDoctorNonVerified');

const router = express.Router();

router.get('/onboarding-status', authdoctornonverified(), authDoctorController.onboardingstatus);

router.post('/register', authDoctorController.register);
router.post('/login', validate(authDoctorValidation.login), authDoctorController.login);
router.post('/logout', validate(authDoctorValidation.logout), authDoctorController.logout); // Thinking to make it GET and Validated
router.post('/forgot-password', validate(authDoctorValidation.forgotPassword), authDoctorController.forgotPassword);
router.post('/reset-password', validate(authDoctorValidation.resetPassword), authDoctorController.resetPassword);
router.post('/send-verification-email', authdoctornonverified(), authDoctorController.sendVerificationEmail);
router.post('/change-email', authdoctornonverified(), authDoctorController.changeEmail);
router.post('/change-phone', authdoctornonverified(), authDoctorController.changePhone);
router.post('/verify-email', authdoctornonverified(), validate(authDoctorValidation.verifyEmail), authDoctorController.verifyEmail);
router.post('/change-password', authdoctornonverified(), validate(authDoctorValidation.changepassword), authDoctorController.changePassword );
router.post('/request-otp', authdoctornonverified(), authDoctorController.requestOtp);
router.post('/verify-phone', authdoctornonverified(), validate(authDoctorValidation.verifyPhone), authDoctorController.verifyPhone );
router.post('/resend-otp', authdoctornonverified(), authDoctorController.resendOtp);

module.exports = router;
