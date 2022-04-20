const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const walletSchema = mongoose.Schema(
  {
    balance: {
      type: Number,
      default: 0,
    },
    cashback: {
      type: Number,
      default: 0,
    },
    auth: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auth',
      required: true,
    },
    transactions: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
walletSchema.plugin(toJSON);
walletSchema.plugin(paginate);

/**
 * @typedef Wallet
 */
const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
