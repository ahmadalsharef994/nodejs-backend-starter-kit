const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { razorpayPaymentServices } = require('../Microservices');
const { authService } = require('../services');

const createLabtestOrder = catchAsync(async (req, res) => {
  // createRazorpayOrder -> createLabtestOrder
  const { labTestOrderID, sessionID } = req.body; // orderId, labtestId

  const currency = 'INR';
  const response = await razorpayPaymentServices.createLabtestOrder(currency, labTestOrderID, sessionID);
  res.status(httpStatus.OK).json({
    id: response.id,
    currency: response.currency,
    amount: response.amount,
  });
});

const verifyLabtestOrder = catchAsync(async (req, res) => {
  // razorpayVerification -> verifyLabtestOrder
  const calculatedSHADigest = await razorpayPaymentServices.calculateSHADigest(
    // calculateSHADigestLabtest
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
  verifyLabtestOrder,
  createLabtestOrder,
  createAppointmentOrder,
  verifyAppointmentOrder,
  createWalletOrder,
  verifyWalletOrder,
  fetchRazorpayOrderStatus,
};
