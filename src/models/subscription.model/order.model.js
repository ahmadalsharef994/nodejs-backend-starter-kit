const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');
const Product = require('./product.model');
const Package = require('./package.model');
const Subscription = require('./subscription.model');

const OrderSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['product', 'package', 'subscription'],
      required: true,
    },
    totalOrder: {
      type: Number,
      required: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Product,
        default: [],
      },
    ],
    packages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Package,
        default: [],
      },
    ],
    subscription: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Subscription,
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

OrderSchema.plugin(toJSON);
OrderSchema.plugin(paginate);

// create product model
const Order = mongoose.model('Order', OrderSchema);
// export product model
module.exports = Order;
