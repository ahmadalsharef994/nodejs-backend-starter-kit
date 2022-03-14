const crypto = require('crypto');
const Razorpay = require('razorpay');
const short = require('short-uuid');
const httpStatus = require('http-status');
// const { compareSync } = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const { RazorpayPayment, GuestOrder, Appointment, razorpayConsultation } = require('../models');
const { getCartValue } = require('../services/labTest.service');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const calculateSHADigest = async (orderCreationId, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
  const calculatedSHADigest = shasum.digest('hex');

  if (calculatedSHADigest === razorpaySignature) {
    // console.log('request is legit');
    await RazorpayPayment.findOneAndUpdate({ razorpayOrderID: razorpayOrderId }, { $set: { isPaid: true } }, { new: true });
    return 'match';
  }
  // console.log('calculatedSHADigest: ', digest);
  return 'no_match';
};

const createRazorpayOrder = async (currency, labTestOrderID, sessionID) => {
  const labTestObject = await GuestOrder.findOne({ orderId: labTestOrderID });
  const cartObject = await getCartValue(labTestObject.cart, labTestObject.couponCode);
  const orderAmount = cartObject.totalCartAmount;

  const options = {
    amount: orderAmount * 100,
    currency,
    receipt: short.generate(),
  };

  try {
    const response = await razorpay.orders.create(options);
    response.amount /= 100;

    const razorpayOrderID = response.id;
    await RazorpayPayment.create({
      razorpayOrderID,
      labTestOrderID,
      amount: orderAmount,
      currency,
      sessionID,
    });

    return response;
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND);
  }
};

const createAppointmentOrder = async (currency, appointmentid, orderId) => {
  const { _id, price } = await Appointment.findOne({ orderId });
  const options = {
    amount: price * 100,
    currency,
    receipt: short.generate(),
  };
  try {
    const response = await razorpay.orders.create(options);
    response.amount /= 100;

    const razorpayOrderID = response.id;
    razorpayConsultation.create({
      razorpayOrderID,
      AppointmentOrderID: orderId,
      amount: price,
      currency,
      appointmentId: _id,
    });
    return response;
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND);
  }
};

const calculateSHADigestAppointment = async (orderCreationId, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
  const calculatedSHADigest = shasum.digest('hex');
  if (calculatedSHADigest === razorpaySignature) {
    // console.log('request is legit');
    await razorpayConsultation.findOneAndUpdate({ razorpayOrderID: razorpayOrderId }, { $set: { isPaid: true } });
    await Appointment.findOneAndUpdate({ orderId: orderCreationId }, { $set: { paymentStatus: 'PAID' } });
    return 'match';
  }
  // console.log('calculatedSHADigest: ', digest);
  return 'no_match';
};

module.exports = {
  calculateSHADigest,
  createRazorpayOrder,
  createAppointmentOrder,
  calculateSHADigestAppointment,
};
