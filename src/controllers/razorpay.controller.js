const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { razporpayPaymentServices } = require('../Microservices');

const razorpayVerification = catchAsync(async (req, res) => {
  const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body.response
  const {labTestOrderId, sessionId} = req.body

  const calculatedSHADigest = await razporpayPaymentServices.calculateSHADigest(razorpay_order_id, razorpay_payment_id, razorpay_signature, labTestOrderId, sessionId);
  // console.log('x-razorpay-signature: ', req.headers['x-razorpay-signature']);

  if (calculatedSHADigest === "match") {
    // console.log('request is legit');
    return res.status(httpStatus.OK).json({ message: 'OK' });
  }
  return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid Signature' });
});

const razorpayCreateOrder = catchAsync(async (req, res) => {
  const { amount } = req.body;
  const currency = 'INR';

  const response = await razporpayPaymentServices.createRazorpayOrder(amount, currency);
  res.status(httpStatus.OK).json({
    id: response.id,
    currency: response.currency,
    amount: response.amount,
  });
});

module.exports = {
  razorpayVerification,
  razorpayCreateOrder,
};
