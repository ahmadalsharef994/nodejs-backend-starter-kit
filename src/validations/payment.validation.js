import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createOrder = {
  body: Joi.object().keys({
    amount: Joi.number().integer().required(),
    currency: Joi.string().valid('INR', 'USD').default('INR'),
    receipt: Joi.string().required(),
  }),
};

const verifyPayment = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    razorpay_order_id: Joi.string().required(),
    razorpay_payment_id: Joi.string().required(),
    razorpay_signature: Joi.string().required(),
  }),
};

const getOrder = {
  params: Joi.object().keys({
    orderId: Joi.string().custom(objectId),
  }),
};

const getOrders = {
  query: Joi.object().keys({
    status: Joi.string().valid('created', 'attempted', 'paid', 'failed'),
    userId: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const createRefund = {
  body: Joi.object().keys({
    paymentId: Joi.string().required(),
    amount: Joi.number().integer(),
    reason: Joi.string(),
  }),
};

const webhook = {
  body: Joi.object().keys({
    entity: Joi.string().required(),
    account_id: Joi.string().required(),
    event: Joi.string().required(),
    contains: Joi.array().items(Joi.string()).required(),
    payload: Joi.object().required(),
    created_at: Joi.number().required(),
  }),
};

export {
  createOrder,
  verifyPayment,
  getOrder,
  getOrders,
  createRefund,
  webhook,
};
