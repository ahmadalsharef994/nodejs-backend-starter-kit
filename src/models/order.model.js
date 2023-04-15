// const mongoose = require('mongoose');
// const { toJSON, paginate } = require('./plugins');

// const orderSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       required: true,
//     },
//     cart: {
//       // object
//       type: Object,
//       required: true,
//     },
//     amount: {
//       type: Number,
//       required: true,
//     },
//     cashback: {
//       type: Number,
//     },
//     paymentMethod: {
//       type: String,
//       default: 'CASH ON DELIVERY',
//     },
//     paymentStatus: {
//       type: String,
//       default: 'UNPAID',
//       enum: ['PAID', 'UNPAID', 'REFUNDED'],
//     },
//     status: {
//       type: String,
//       default: 'ORDERED',
//       enum: ['PENDING', 'ORDERED', 'SHIPPED', 'CANCELLED'],
//     },
//     paymentDate: {
//       type: Date,
//     },
//     paymentRef: {
//       type: String,
//     },
//     shippingDetails: {
//       name: {
//         type: String,
//         required: true,
//       },
//       address: {
//         type: String,
//         required: true,
//       },
//       city: {
//         type: String,
//         required: true,
//       },
//       state: {
//         type: String,
//         required: true,
//       },
//       pincode: {
//         type: String,
//         required: true,
//       },
//       phone: {
//         type: String,
//         required: true,
//       },
//       email: {
//         type: String,
//         required: true,
//       },
//       deliveryNotes: {
//         type: String,
//         default: '',
//       },
//       expectedDeliveryDate: {
//         type: Date,
//       },
//       trackingId: {
//         type: String,
//         default: '',
//       },
//       shippingStatus: {
//         type: String,
//         default: 'UNSHIPPED',
//         enum: ['UNSHIPPED', 'SHIPPED', 'OUT FOR DELIVERY', 'DELIVERED', 'CANCELLED'],
//       },
//       courier: {
//         type: String,
//         default: '',
//       },
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// orderSchema.set('toJSON', { virtuals: true });

// orderSchema.plugin(toJSON);
// orderSchema.plugin(paginate);

// module.exports = mongoose.model('Order', orderSchema);
