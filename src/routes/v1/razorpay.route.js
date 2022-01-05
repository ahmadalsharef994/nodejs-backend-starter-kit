const express = require('express');
const validate = require('../../middlewares/validate');
const razorpayController = require('../../controllers/razorpay.controller');
const razorpayValidation = require('../../validations/razorpay.validation');

const router = express.Router();

router.route('/create-order').post(validate(razorpayValidation), razorpayController.razorpayCreateOrder);
router.route('/checkout-verify').post(razorpayController.razorpayVerification);

module.exports = router;
