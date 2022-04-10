const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const Auth = require('./auth.model');
const Wallet = require('./wallet.model');

const WalletOrderSchema = mongoose.Schema({
  auth: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Auth,
    required: true,
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Wallet,
    required: true,
  },
  razorpayOrderID: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  amount: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false,
  },
});

// add plugin that converts mongoose to json
WalletOrderSchema.plugin(toJSON);
WalletOrderSchema.plugin(paginate);

/**
 * @typedef walletDepositOrder
 */

const WalletOrder = mongoose.model('WalletOrder', WalletOrderSchema);
module.exports = WalletOrder;
