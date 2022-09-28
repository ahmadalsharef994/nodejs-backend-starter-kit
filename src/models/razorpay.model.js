// const mongoose = require('mongoose');
// const { toJSON, paginate } = require('./plugins');

// const razorpaySchema = new mongoose.Schema(
//   {
//     orderId: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     razorpayOrderId: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     razorpayPaymentId: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     razorpaySignature: {
//       type: String,
//       required: true,
//     },
//     razorpayAmount: {
//       type: Number,
//       required: true,
//     },
//     razorpayCurrency: {
//       type: String,
//       default: 'INR',
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Add plugins to the schema
// razorpaySchema.plugin(toJSON);
// razorpaySchema.plugin(paginate);

// module.exports = mongoose.model('Razorpay', razorpaySchema);
