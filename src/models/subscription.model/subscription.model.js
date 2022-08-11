/* eslint-disable default-case */
const mongoose = require('mongoose');
const { toJSON, paginate } = require('../plugins');
const Auth = require('../auth.model');
const Cart = require('./cart.model');

function getMonthDifference(startDate, endDate) {
  return endDate.getMonth() - startDate.getMonth() + 12 * (endDate.getFullYear() - startDate.getFullYear());
}

function getWeekDifference(startDate, endDate) {
  return (
    endDate.getDate() -
    startDate.getDate() +
    7 * (endDate.getMonth() - startDate.getMonth()) +
    365 * (endDate.getFullYear() - startDate.getFullYear())
  );
}

function getFortnightDifference(startDate, endDate) {
  return (
    endDate.getDate() -
    startDate.getDate() +
    14 * (endDate.getMonth() - startDate.getMonth()) +
    365 * (endDate.getFullYear() - startDate.getFullYear())
  );
}

// create Subscription model
const SubscriptionSchema = new mongoose.Schema(
  {
    authId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Auth,
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Cart,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    totalSubscription: {
      type: Number,
      default() {
        switch (this.frequency) {
          case 'WEEKLY':
            return this.cart.totalCart * getWeekDifference(this.startDate, this.endDate);
          case 'MONTHLY':
            return this.cart.totalCart * getMonthDifference(this.startDate, this.endDate);
          case 'FORTNIGHTLY':
            return this.cart.totalCart * getFortnightDifference(this.startDate, this.endDate);
        }
      },
    },
    frequency: {
      type: String,
      enum: ['WEEKLY', 'FORTNIGHTLY', 'MONTHLY'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

SubscriptionSchema.plugin(toJSON);
SubscriptionSchema.plugin(paginate);

const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;
