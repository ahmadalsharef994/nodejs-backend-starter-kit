const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { razorpayPaymentServices } = require('../Microservices');
const { authService } = require('../services');

const createAppointmentOrder = catchAsync(async (req, res) => {
  // razorpayAppointment -> createAppointmentOrder
  const { orderId, appointmentId } = req.body;
  const currency = 'INR';
  const response = await razorpayPaymentServices.createAppointmentOrder(currency, appointmentId, orderId);
  res.send(response);
});

const verifyAppointmentOrder = catchAsync(async (req, res) => {
  // razorpayAppointmentVerification -> verifyAppointmentOrder
  const calculatedSHADigest = await razorpayPaymentServices.calculateSHADigestAppointment(
    req.body.razorpay_order_id,
    req.body.razorpay_payment_id,
    req.body.razorpay_signature
  );
  // console.log('x-razorpay-signature: ', req.headers['x-razorpay-signature']);
  if (calculatedSHADigest === 'match') {
    // console.log('request is legit');
    return res.status(httpStatus.OK).json({ message: 'OK' });
  }
  return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid Signature' });
});

const createWalletOrder = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const { walletId, amount } = req.body;
  const currency = 'INR';
  const response = await razorpayPaymentServices.createWalletOrder(AuthData, walletId, amount, currency);
  res.send(response);
});

const verifyWalletOrder = catchAsync(async (req, res) => {
  const razorpayOrderStatus = await razorpayPaymentServices.fetchRazorpayOrderStatus(req.body.razorpayOrderId);
  if (razorpayOrderStatus === 'paid') {
    return res.status(httpStatus.OK).json({ message: 'OK' });
  }
  return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid Signature' });
});

const fetchRazorpayOrderStatus = catchAsync(async (req, res) => {
  const response = await razorpayPaymentServices.fetchRazorpayOrderStatus(req.body.razorpayOrderId);
  res.send(response);
});

module.exports = {
  createAppointmentOrder,
  verifyAppointmentOrder,
  createWalletOrder,
  verifyWalletOrder,
  fetchRazorpayOrderStatus,
};
