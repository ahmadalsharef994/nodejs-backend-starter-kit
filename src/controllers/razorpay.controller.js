const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { razorpayPaymentServices } = require('../Microservices');

const razorpayVerification = catchAsync(async (req, res) => {
  const calculatedSHADigest = await razorpayPaymentServices.calculateSHADigest(
    req.body.orderCreationId,
    req.body.razorpayOrderId,
    req.body.razorpayPaymentId,
    req.body.razorpaySignature
  );
  // console.log('x-razorpay-signature: ', req.headers['x-razorpay-signature']);

  if (calculatedSHADigest === 'match') {
    // console.log('request is legit');
    return res.status(httpStatus.OK).json({ message: 'OK' });
  }
  return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid Signature' });
});

const razorpayCreateOrder = catchAsync(async (req, res) => {
  const { labTestOrderID, sessionID } = req.body;

  const currency = 'INR';
  const response = await razorpayPaymentServices.createRazorpayOrder(currency, labTestOrderID, sessionID);
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
