const crypto = require('crypto');
const Razorpay = require('razorpay');
const short = require('short-uuid');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const calculateSHADigest = async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const secret = process.env.RAZORPAY_UAT_SECRET;

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(body));
  const calculatedSHADigest = shasum.digest('hex');

  if (calculatedSHADigest === razorpaySignature) {
    // console.log('request is legit');
    return 'match';
  }
  // console.log('calculatedSHADigest: ', digest);
  return 'no_match';
};

const createRazorpayOrder = async (amount, currency) => {
  const options = {
    amount: amount * 100,
    currency,
    receipt: short.generate(),
  };

  try {
    const response = await razorpay.orders.create(options);
    // console.log('razorpayResponse: ', response); // response shown
    return response;
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND);
  }
};

module.exports = {
  calculateSHADigest,
  createRazorpayOrder,
};
