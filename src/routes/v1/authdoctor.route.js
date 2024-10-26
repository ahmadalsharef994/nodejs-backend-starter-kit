const express = require('express');
const validate = require('../../middlewares/validate');
const authDoctorValidation = require('../../validations/authDoctor.validation');
const authDoctorController = require('../../controllers/authdoctor.controller');
const authDoctor = require('../../middlewares/authDoctor');
const deviceauth = require('../../middlewares/deviceauth');

const router = express.Router();

router.post('/register', deviceauth(), validate(authDoctorValidation.register), authDoctorController.register);
router.post('/login', deviceauth(), validate(authDoctorValidation.login), authDoctorController.login);
router.post('/logout', validate(authDoctorValidation.logout), authDoctorController.logout); // Thinking to make it GET and Validated
router.post('/forgot-password', validate(authDoctorValidation.forgotPassword), authDoctorController.forgotPassword);

router.post('/reset-password', validate(authDoctorValidation.resetPassword), authDoctorController.resetPassword);
router.post(
  '/change-password',
  authDoctor(),
  validate(authDoctorValidation.changepassword),
  authDoctorController.changePassword
);

// router.post('/verify-otp', validate(authDoctorValidation.verifyOtp), authDoctorController.verifyOtp);

// router.post('/send-verification-email', authDoctor(), authDoctorController.sendVerificationEmail);
// router.post('/verify-email', authDoctor(), validate(authDoctorValidation.verifyEmail), authDoctorController.verifyEmail);

// router.post('/change-email', authDoctor(), authDoctorController.changeEmail);
// router.post('/change-phone', authDoctor(), authDoctorController.changePhone);

// router.post('/request-otp', authDoctor(), authDoctorController.requestOtp);
// router.post('/verify-phone', authDoctor(), validate(authDoctorValidation.verifyPhone), authDoctorController.verifyPhone);
// router.post('/resend-otp', authDoctor(), authDoctorController.resendOtp);

module.exports = router;
