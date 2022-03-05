const Joi = require('joi');

const cartAmount = {
  body: Joi.object().keys({
    labTestOrderID: Joi.string().required(),
    sessionID: Joi.string().required(),
  }),
};

const checkout = {
  body: Joi.object().keys({
    orderCreationId: Joi.string().required(),
    razorpayOrderId: Joi.string().required(),
    razorpayPaymentId: Joi.string().required(),
    razorpaySignature: Joi.string().required(),
  }),
};

const AppointmentOrder = {
  body: Joi.object().keys({
    orderId: Joi.string().required(),
    appointmentId: Joi.string().required(),
  }),
};
const AppointmentCheckout = {
  body: Joi.object().keys({
    orderCreationId: Joi.string().required(),
    razorpayOrderId: Joi.string().required(),
    razorpayPaymentId: Joi.string().required(),
    razorpaySignature: Joi.string().required(),
  }),
};
module.exports = {
  cartAmount,
  checkout,
  AppointmentOrder,
  AppointmentCheckout,
};
