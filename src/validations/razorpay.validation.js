const Joi = require('joi');

// eslint-disable-next-line prettier/prettier
const createLabtestOrder = { // cartAmount -> createLabtestOrder
  body: Joi.object().keys({
    labTestOrderID: Joi.string().required(), // orderId
    sessionID: Joi.string().required(), // labtestId
  }),
};

// eslint-disable-next-line prettier/prettier
const verifyLabtestOrder = { // checkout -> verifyLabtestOrder
  body: Joi.object().keys({
    orderCreationId: Joi.string().required(),
    razorpayOrderId: Joi.string().required(),
    razorpayPaymentId: Joi.string().required(),
    razorpaySignature: Joi.string().required(),
  }),
};

// eslint-disable-next-line prettier/prettier
const createAppointmentOrder = { // AppointmentOrder -> createAppointmentOrder
  body: Joi.object().keys({
    orderId: Joi.string().required(), // appointmentOrderId
    appointmentId: Joi.string().required(),
  }),
};
// eslint-disable-next-line prettier/prettier
const verifyApoointmentOrder = { // AppointmentCheckout -> verifyApoointmentOrder
  body: Joi.object().keys({
    orderCreationId: Joi.string().required(),
    razorpayOrderId: Joi.string().required(),
    razorpayPaymentId: Joi.string().required(),
    razorpaySignature: Joi.string().required(),
  }),
};

const createWalletOrder = {
  body: Joi.object().keys({
    // walletOrderId: Joi.string().required(),
    walletId: Joi.string().required(),
    amount: Joi.number().precision(2).min(0).max(50000).required(),
  }),
};

// const verifyWalletOrder = {
//   body: Joi.object().keys({
//     orderCreationId: Joi.string().required(),
//     razorpayOrderId: Joi.string().required(),
//     razorpayPaymentId: Joi.string().required(),
//     razorpaySignature: Joi.string().required(),
//   }),
// };

const fetchRazorpayOrderStatus = {
  body: Joi.object().keys({
    razorpayOrderId: Joi.string().required(),
  }),
};

module.exports = {
  createLabtestOrder,
  verifyLabtestOrder,
  createAppointmentOrder,
  verifyApoointmentOrder,
  createWalletOrder,
  fetchRazorpayOrderStatus,
};
