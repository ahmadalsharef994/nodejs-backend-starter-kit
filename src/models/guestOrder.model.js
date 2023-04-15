// const mongoose = require('mongoose');
// const { toJSON, paginate } = require('./plugins');

// const GuestOrderSchema = mongoose.Schema(
//   {
//     customerDetails: {
//       type: Object,
//       required: true,
//     },
//     testDetails: {
//       type: Object,
//       required: true,
//     },
//     paymentDetails: {
//       type: Object,
//       required: true,
//     },
//     sessionId: {
//       type: String,
//       required: true,
//     },
//     orderId: {
//       type: String,
//       required: true,
//     },
//     cart: {
//       type: Array,
//       required: true,
//     },
//     couponCode: {
//       type: String,
//       default: null,
//     },
//     homeCollectionFee: {
//       type: Number,
//       default: null,
//     },
//     totalCartAmount: {
//       type: Number,
//       required: true,
//     },
//     moneySaved: {
//       type: Number,
//       default: null,
//     },
//     couponStatus: {
//       type: String,
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // add plugin that converts mongoose to json
// GuestOrderSchema.plugin(toJSON);
// GuestOrderSchema.plugin(paginate);

// /**
//  * @typedef GuestOrder
//  */

// const GuestOrder = mongoose.model('GuestOrder', GuestOrderSchema);
// module.exports = GuestOrder;
