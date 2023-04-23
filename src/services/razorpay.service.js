// const Razorpay = require('razorpay');
// const httpStatus = require('http-status');
// const ApiError = require('../utils/ApiError');
// const Order = require('../models/order.model');

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YuZntGICWmImAz',
//   key_secret: process.env.RAZORPAY_KEY_SECRET || 'EyjZecNCbfofhufWT9a7ozwb',
// });

// const getRazorpayOrder = async (razorpayOrderId) => {
//   const razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);
//   if (razorpayOrder.error) {
//     throw new ApiError(httpStatus.BAD_REQUEST, `getStatus service: ${razorpayOrder.error.description}`);
//   }
//   return razorpayOrder;
// };

// const createRazorpayOrder = async (orderId) => {
//   const order = await Order.findById(orderId);
//   const razorpayOrder = await razorpay.orders.create({
//     amount: order.amount,
//     notes: {
//       order_id: orderId,
//     },
//   });
//   if (razorpayOrder.error) {
//     throw new ApiError(httpStatus.BAD_REQUEST, `payOrder service: ${razorpayOrder.error.description}`);
//   }
//   order.paymentRef = razorpayOrder.id;
//   await order.save();
//   return razorpayOrder;
// };

// const createRazorpayPayment = async (orderId) => {
//   const order = await Order.findById(orderId);
//   const razorpayPayment = razorpay.payments.createPaymentJson({
//     amount: 100,
//     currency: 'INR',
//     email: 'gaurav.kumar@example.com',
//     contact: '9123456789',
//     order_id: 'order_KCXbXeev1x7fnr',
//     method: 'netbanking',
//     bank: 'HDFC',
//   });
//   if (razorpayPayment.error) {
//     throw new ApiError(httpStatus.BAD_REQUEST, `createRazorpayPayment service: ${razorpayPayment.error.description}`);
//   }
//   order.paymentId = razorpayPayment.id;
//   order.paymentStatus = 'PAID';
//   order.status = 'ORDERED';
//   // order.shippingDetails.shippingStatus = 'SHIPPED';
//   await order.save();
//   return razorpayPayment;
// };

// // razorpay refund
// const refundOrder = async (orderId) => {
//   const order = await Order.findById(orderId);

//   const razorpayOrder = await razorpay.payments.refund(order.paymentRef, {
//     amount: order.amount,
//     notes: {
//       order_id: orderId,
//     },
//   });
//   if (razorpayOrder.error) {
//     throw new ApiError(httpStatus.BAD_REQUEST, `refundOrder service: ${razorpayOrder.error.description}`);
//   }
//   order.paymentStatus = 'REFUNDED';
//   order.status = 'CANCELLED';
//   await order.save();
//   return razorpayOrder;
// };

// module.exports = {
//   getRazorpayOrder,
//   createRazorpayOrder,
//   createRazorpayPayment,
//   refundOrder,
// };
