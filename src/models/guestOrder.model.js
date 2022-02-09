const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const GuestOrderSchema = mongoose.Schema(
  {
    customerDetails: {
      type: Object,
      required: true,
    },
    testDetails: {
      type: Object,
      required: true,
    },
    paymentDetails: {
      type: Object,
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    cart: {
      type: Array,
      required: true,
    },
    coupon: {
      type: String,
      default: null,
    },
    homeCollectionFee: {
      type: Number,
      default: null,
    },
    totalCartAmount: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
GuestOrderSchema.plugin(toJSON);
GuestOrderSchema.plugin(paginate);

/**
 * @typedef GuestOrder
 */

const GuestOrder = mongoose.model('GuestOrder', GuestOrderSchema);
module.exports = GuestOrder;
