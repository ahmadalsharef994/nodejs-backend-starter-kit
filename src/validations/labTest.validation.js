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

// not supported by thyrocare
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

module.exports = {
  PincodeAvailability,
  dateAvailability,
  fixSlot,
  thyrocareOrder,
  orderSummary,
  getMyReport,
  cancelOrder,
  rescheduleOrder,
};
