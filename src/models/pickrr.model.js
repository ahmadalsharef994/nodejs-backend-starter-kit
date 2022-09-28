const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const pickrrOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  item_name: {
    type: String,
    required: true,
  },
  item_list: {
    type: Array,
  },
  from_name: {
    type: String,
    required: true,
  },
  from_phone_number: {
    type: String,
    required: true,
  },
  from_address: {
    type: String,
    required: true,
  },
  from_pincode: {
    type: String,
    required: true,
  },
  to_name: {
    type: String,
    required: true,
  },
  to_phone_number: {
    type: String,
    required: true,
  },
  to_pincode: {
    type: String,
    required: true,
  },
  to_address: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: false,
    default: 1,
  },
  invoice_value: {
    // total shipment invoice value
    type: Number,
    required: true,
  },
  cod_amount: {
    // for Cash on Delivery
    type: Number,
    required: false,
    default: 0,
  },
});

pickrrOrderSchema.plugin(toJSON);
pickrrOrderSchema.plugin(paginate);

const PickrrOrder = mongoose.model('PickrrOrder', pickrrOrderSchema);

module.exports = PickrrOrder;
