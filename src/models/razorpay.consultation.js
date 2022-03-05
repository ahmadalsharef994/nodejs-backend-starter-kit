const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const RazorpayPaymentSchema = mongoose.Schema(
  {
    razorpayOrderID: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    AppointmentOrderID: {
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
    appointmentId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
RazorpayPaymentSchema.plugin(toJSON);
RazorpayPaymentSchema.plugin(paginate);

/**
 * @typedef RazorpayPayment
 */

const RazorpayConsultation = mongoose.model('RazorpayConsultation', RazorpayPaymentSchema);
module.exports = RazorpayConsultation;
