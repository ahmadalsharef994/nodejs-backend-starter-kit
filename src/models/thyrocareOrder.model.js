const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const thyrocareOrderSchema = mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  orderResponseDetails: {
    type: Object,
    required: true,
  },
  respId: {
    type: String,
    required: true,
  },
  response: {
    type: String,
    required: true,
  },
  orderNo: {
    type: String,
    required: true,
    index: true,
  },
  product: {
    type: String,
    required: true,
  },
  serviceType: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    required: true,
  },
  reportHardCopy: {
    type: String,
    required: true,
  },
  customerRate: {
    type: Number,
    required: true,
  },
  bookedBy: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  payType: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  refOrderId: {
    type: String,
    required: true,
  },
  fasting: {
    type: String,
    required: true,
  },
  qr: {
    type: String,
  },
  collectionType: {
    type: String,
  },
  collectionCenters: {
    type: String,
  },
});

// add plugin that converts mongoose to json
thyrocareOrderSchema.plugin(toJSON);

/**
 * @typedef ThyrocareOrder
 */
const ThyrocareOrder = mongoose.model('ThyrocareOrder', thyrocareOrderSchema);

module.exports = ThyrocareOrder;
