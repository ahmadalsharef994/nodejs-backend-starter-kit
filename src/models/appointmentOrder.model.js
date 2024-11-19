// filename: appointmentOrder.model.js
const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const appointmentOrderSchema = mongoose.Schema(
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
appointmentOrderSchema.plugin(toJSON);
appointmentOrderSchema.plugin(paginate);

/**
 * @typedef AppointmentOrder
 */

const AppointmentOrder = mongoose.model('AppointmentOrder', appointmentOrderSchema);
module.exports = AppointmentOrder;
// appointmentOrder -> AppointmentOrder
