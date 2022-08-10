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
    sourcePinCode: {
      type: String,
      required: true,
    },
    destinationPinCode: {
      type: String,
      required: true,
    },
    sourceAddress: {
      type: String,
      required: true,
    },
    destinationAddress: {
      type: String,
      required: true,
    },
    ETA: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'delivered'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'Online'],
      default: 'COD',
    },
    currentLocation: {
      type: String,
      required: true,
    },
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
