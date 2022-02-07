const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const thyrocareOrderSchema = mongoose.Schema({
  sessionId: {
    type: String,
  },
  orderResponseDetails: {
    type: Object,
  },
  respId: {
    type: String,
  },
  response: {
    type: String,
  },
  orderNo: {
    type: String,
    index: true,
  },
  product: {
    type: String,
  },
  serviceType: {
    type: String,
  },
  mode: {
    type: String,
  },
  reportHardCopy: {
    type: String,
  },
  customerRate: {
    type: Number,
  },
  bookedBy: {
    type: String,
  },
  status: {
    type: String,
  },
  payType: {
    type: String,
  },
  mobile: {
    type: Number,
  },
  address: {
    type: String,
  },
  email: {
    type: String,
  },
  refOrderId: {
    type: String,
  },
  fasting: {
    type: String,
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
thyrocareOrderSchema.plugin(paginate);

/**
 * @typedef ThyrocareOrder
 */
const ThyrocareOrder = mongoose.model('ThyrocareOrder', thyrocareOrderSchema);

module.exports = ThyrocareOrder;
