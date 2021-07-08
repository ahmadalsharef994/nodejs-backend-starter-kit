const express = require('express');
const validate = require('../../middlewares/validate');
const authDoctorValidation = require('../../validations/authDoctor.validation');
const authDoctorController = require('../../controllers/authdoctor.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.post('/register', validate(authDoctorValidation.registerdoctor), authDoctorController.register);
router.post('/login', validate(authDoctorValidation.login), authDoctorController.login);
router.post('/logout', validate(authDoctorValidation.logout), authDoctorController.logout);
router.post('/forgot-password', validate(authDoctorValidation.forgotPassword), authDoctorController.forgotPassword);
router.post('/reset-password', validate(authDoctorValidation.resetPassword), authDoctorController.resetPassword);
router.post('/send-verification-email', auth(), authDoctorController.sendVerificationEmail);
router.post('/verify-email', auth(), validate(authDoctorValidation.verifyEmail), authDoctorController.verifyEmail);
router.post('/change-password', auth(), validate(authDoctorValidation.changepassword), authDoctorController.changePassword);
router.post('/request-otp', auth(), authDoctorController.requestOtp);
router.post('/verify-phone', auth(), validate(authDoctorValidation.verifyPhone), authDoctorController.verifyPhone);
router.post('/resend-otp', auth(), authDoctorController.resendOtp);

module.exports = router;    