import express from 'express';
import validate from '../../middlewares/validate.js';
import * as paymentValidation from '../../validations/payment.validation.js';
import * as paymentController from '../../controllers/payment.controller.js';
import { auth } from '../../middlewares/auth.js';

const router = express.Router();

router
  .route('/orders')
  .post(auth(), validate(paymentValidation.createOrder), paymentController.createOrder);

router
  .route('/orders/:orderId/verify')
  .post(auth(), validate(paymentValidation.verifyPayment), paymentController.verifyPayment);

router
  .route('/orders/:orderId')
  .get(auth(), validate(paymentValidation.getOrder), paymentController.getOrder);

router
  .route('/orders')
  .get(auth(), validate(paymentValidation.getOrders), paymentController.getOrders);

router
  .route('/refunds')
  .post(auth(), validate(paymentValidation.createRefund), paymentController.createRefund);

router
  .route('/webhook')
  .post(validate(paymentValidation.webhook), paymentController.handleWebhook);

export default router;
