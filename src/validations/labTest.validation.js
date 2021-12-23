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

const thyrocareOrder = {
  body: Joi.object().keys({
    fullName: Joi.string().required(),
    age: Joi.number().required().min(1).max(130),
    gender: Joi.string().required().valid('male', 'female'), // no idea for transgender
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

module.exports = {
  PincodeAvailability,
  dateAvailability,
  thyrocareOrder,
};
