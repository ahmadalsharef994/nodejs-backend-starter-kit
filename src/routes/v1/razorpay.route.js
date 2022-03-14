const express = require('express');
const validate = require('../../middlewares/validate');
const razorpayController = require('../../controllers/razorpay.controller');
const razorpayValidation = require('../../validations/razorpay.validation');

const router = express.Router();

router.route('/create-order').post(validate(razorpayValidation.cartAmount), razorpayController.razorpayCreateOrder);
router.route('/checkout-verify').post(validate(razorpayValidation.checkout), razorpayController.razorpayVerification);

router
  .route('/createorder-appointment')
  .post(validate(razorpayValidation.AppointmentOrder), razorpayController.razorpayAppointment);
router
  .route('/verifyorder-appointment')
  .post(validate(razorpayValidation.AppointmentCheckout), razorpayController.razorpayAppointmentVerification);
module.exports = router;
