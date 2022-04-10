const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const walletWithdrawRequestSchema = mongoose.Schema(
  {
    AuthData: {
      type: Object,
      default: null,
    },
    transactionDetails: {
      type: Object,
      default: null,
    },
    status: {
      type: String,
      default: 'NOT FULFILLED',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
walletWithdrawRequestSchema.plugin(toJSON);
walletWithdrawRequestSchema.plugin(paginate);

/**
 * @typedef Wallet
 */
const WalletWithdrawRequest = mongoose.model('WalletWithdrawRequest', walletWithdrawRequestSchema);

module.exports = WalletWithdrawRequest;
