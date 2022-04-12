// filename: labtestOrder.model.js

const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const labtestOrderSchema = mongoose.Schema(
  {
    razorpayOrderID: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    labTestOrderID: {
      type: String,
      required: true,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    amount: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    sessionID: {
      // labtestId
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
labtestOrderSchema.plugin(toJSON);
labtestOrderSchema.plugin(paginate);

/**
 * @typedef labtestOrder
 */

const labtestOrder = mongoose.model('labtestOrder', labtestOrderSchema);
module.exports = labtestOrder;
