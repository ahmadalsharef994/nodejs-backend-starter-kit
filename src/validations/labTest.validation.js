const Joi = require('joi').extend(require('@joi/date'));

const PincodeAvailability = {
  body: Joi.object().keys({
    pincode: Joi.number().required().min(100000).max(999999),
  }),
};

const dateAvailability = {
  body: Joi.object().keys({
    pincode: Joi.number().required().min(100000).max(999999),
    date: Joi.string()
      .required()
      .regex(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/),
  }),
};

const guestOrder = {
  body: Joi.object().keys({
    customerDetails: Joi.object().keys({
      name: Joi.string().required(),
      mobile: Joi.number().required().min(1000000000).max(9999999999),
      email: Joi.string().email(),
      age: Joi.number().required().min(1).max(130),
      gender: Joi.string().required().valid('male', 'female'), // currently thyrocare supports [male|female] only
      address: Joi.string().required(),
      pincode: Joi.number().required().min(100000).max(999999),
    }),
    testDetails: Joi.object().keys({
      productCode: Joi.array().items(Joi.string()).required().min(1),
      preferredTestDateTime: Joi.string() // YYYY-MM-DD HH:MM AM
        .required()
        .regex(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])\s(1[012]|[0-9]):(5[0-9]|[0-4][0-9])\s(AM|PM)$/),
    }),
    paymentDetails: Joi.object().keys({
      paymentType: Joi.string().required().valid('PREPAID', 'POSTPAID'),
    }),
    cart: Joi.array().items(
      Joi.object().keys({
        productCode: Joi.string().required(),
        quantity: Joi.number().required(),
      })
    ),
  }),
};

const orderSummary = {
  body: Joi.object().keys({
    orderId: Joi.string().required(),
  }),
};

const getMyReport = {
  body: Joi.object().keys({
    leadId: Joi.string().required(),
    userMobileNo: Joi.number().required().min(1000000000).max(9999999999),
  }),
};

const verifyOrder = {
  body: Joi.object().keys({
    sessionId: Joi.string().required(),
    otp: Joi.number().required().min(100000).max(999999),
    orderId: Joi.string().required(),
  }),
};

const cartValue = {
  body: Joi.object().keys({
    cart: Joi.array().items(
      Joi.object().keys({
        productCode: Joi.string().required(),
        quantity: Joi.number().required(),
      })
    ),
  }),
};

const bookPrepaidOrder = {
  body: Joi.object().keys({
    sessionId: Joi.string().required(),
    orderId: Joi.string().required(),
  }),
};
// not supported by thyrocare

/*
const fixSlot = {
  body: Joi.object().keys({
    orderId: Joi.string().required(),
    pincode: Joi.number().required().min(100000).max(999999),
    date: Joi.string()
      .required()
      .regex(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])\s(1[012]|[0-9]):(5[0-9]|[0-4][0-9])\s(AM|PM)$/),
  }),
};

const thyrocareOrder = {
  body: Joi.object().keys({
    fullName: Joi.string().required(),
    age: Joi.number().required().min(1).max(130),
    gender: Joi.string().required().valid('male', 'female'), // currently thyrocare supports [male|female] only
    address: Joi.string().required(),
    pincode: Joi.number().required().min(100000).max(999999),
    productCode: Joi.string().required(),
    mobile: Joi.number().required().min(1000000000).max(9999999999),
    email: Joi.string().email().required(),
    additionalInstructions: Joi.string().required(),
    rateB2C: Joi.string().required(),
    dateTime: Joi.string()
      .required()
      .regex(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])\s(1[012]|[0-9]):(5[0-9]|[0-4][0-9])\s(AM|PM)$/),
    hardCopyReport: Joi.string().valid('Y', 'N'),
    paymentType: Joi.string().required().valid('PREPAID', 'POSTPAID'),
  }),
};

const cancelOrder = {
  body: Joi.object().keys({
    orderId: Joi.string().required(),
    visitId: Joi.string().required(),
    bTechId: Joi.string().required(),
    status: Joi.string().required(),
    appointmentSlot: Joi.string().required(),
  }),
};

const rescheduleOrder = {
  body: Joi.object().keys({
    orderId: Joi.string().required(),
    status: Joi.string().required(),
    others: Joi.string().required(),
    date: Joi.string()
      .required()
      .regex(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/),
    slot: Joi.string().required(),
  }),
};
*/

module.exports = {
  PincodeAvailability,
  dateAvailability,
  orderSummary,
  getMyReport,
  guestOrder,
  verifyOrder,
  cartValue,
  bookPrepaidOrder
  // cancelOrder,
  // rescheduleOrder,
  // fixSlot,
  // thyrocareOrder,
};
