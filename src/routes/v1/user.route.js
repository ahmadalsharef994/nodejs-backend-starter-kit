import express from 'express';
import validate from '../../middlewares/validate.js';
import * as userValidation from '../../validations/user.validation.js';
import * as userController from '../../controllers/user.controller.js';
import { auth } from '../../middlewares/auth.js';

const router = express.Router();

router
  .route('/')
  .get(auth(), validate(userValidation.getUsers), userController.getUsers)
  .post(auth(), validate(userValidation.createUser), userController.createUser);

router
  .route('/:userId')
  .get(auth(), validate(userValidation.getUser), userController.getUser)
  .patch(auth(), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth(), validate(userValidation.deleteUser), userController.deleteUser);

router
  .route('/:userId/avatar')
  .post(auth(), validate(userValidation.uploadAvatar), userController.uploadAvatar);

router
  .route('/profile')
  .get(auth(), userController.getProfile)
  .patch(auth(), validate(userValidation.updateProfile), userController.updateProfile);

export default router;
