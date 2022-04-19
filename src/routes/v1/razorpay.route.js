const express = require('express');
const validate = require('../../middlewares/validate');
const razorpayController = require('../../controllers/razorpay.controller');
const razorpayValidation = require('../../validations/razorpay.validation');
const authUser = require('../../middlewares/authUser');

const router = express.Router();

// changes: createRazorpayOrder -> createLabtestOrder
//          razorpayCreateOrder -> createLabtestOrder
//          razorpayVerification -> verifyLabtestOrder
router.route('/create-order').post(validate(razorpayValidation.cartAmount), razorpayController.createLabtestOrder);
router.route('/checkout-verify').post(validate(razorpayValidation.checkout), razorpayController.verifyLabtestOrder);

// changes: razorpayAppointment -> createAppointmentOrder
//          razorpayAppointmentVerification -> verifyAppointmentOrder
router
  .route('/createorder-appointment')
  .post(validate(razorpayValidation.AppointmentOrder), razorpayController.createAppointmentOrder);
router
  .route('/verifyorder-appointment')
  .post(validate(razorpayValidation.AppointmentCheckout), razorpayController.verifyAppointmentOrder);

router
  .route('/createorder-wallet')
  .post(authUser(), validate(razorpayValidation.createWalletOrder), razorpayController.createWalletOrder);
// router
//   .route('/verifyorder-wallet')
//   .post(authUser(), validate(razorpayValidation.verifyWalletOrder), razorpayController.verifyWalletOrder);

router
  .route('/fetchorder')
  .post(validate(razorpayValidation.fetchRazorpayOrderStatus), razorpayController.fetchRazorpayOrderStatus);

module.exports = router;
