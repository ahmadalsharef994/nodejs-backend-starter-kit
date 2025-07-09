// auth.route.js
import express from 'express';
import validate from '../../middlewares/validate.js';
import * as authValidation from '../../validations/auth.validation.js';
import * as authController from '../../controllers/auth.controller.js';
import { auth } from '../../middlewares/auth.js';

const router = express.Router();

// Unified routes for all roles (user, doctor, admin)
router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.get('/profile', auth(), authController.getProfile);
router.post('/logout', auth(), authController.logout);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
router.post('/change-password', auth(), validate(authValidation.changePassword), authController.changePassword);

export default router;