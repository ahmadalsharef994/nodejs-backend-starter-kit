const Joi = require('joi');

const getBalanceInWallet = {
  query: Joi.object().keys({}),
};

const refundToWallet = {
  body: Joi.object().keys({
    amount: Joi.number().precision(2).min(0).max(50000).required(),
    cashbackAmount: Joi.number().precision(2).min(0).max(50000).required(),
    refundCondition: Joi.required().valid('Cashback', 'Cancelled Appointment', 'Doctor Earning'),
    appointmentId: Joi.objectId(),
    razorpayOrderID: Joi.string(),
  }),
};

const discountFromWallet = {
  body: Joi.object().keys({
    totalPay: Joi.number().precision(2).min(0).max(50000).required(),
  }),
};

const payFromWallet = {
  body: Joi.object().keys({
    payFromCashback: Joi.number().precision(2).min(0).max(50000).required(),
    payFromBalance: Joi.number().precision(2).min(0).max(50000).required(),
  }),
};

const withdrawFromWallet = {
  body: Joi.object().keys({
    amount: Joi.number().precision(2).min(0).max(50000).required(),
    name: Joi.string().max(64),
    accountNumber: Joi.string().required(),
    ifsc: Joi.string().required(),
    email: Joi.string(),
    contact: Joi.string(),
  }),
};

const getWithdrawRequests = {
  query: Joi.object().keys({}),
};

const fullfillWithdrawRequest = {
  body: Joi.object().keys({
    withdrawRequestId: Joi.string().required(),
  }),
};
module.exports = {
  getBalanceInWallet,
  refundToWallet,
  discountFromWallet,
  payFromWallet,
  withdrawFromWallet,
  getWithdrawRequests,
  fullfillWithdrawRequest,
};
