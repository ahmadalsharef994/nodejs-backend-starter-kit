// const mongoose = require('mongoose');
// const { toJSON } = require('./plugins');
// const Auth = require('./auth.model');

// const consultationFee = mongoose.Schema(
//   {
//     Consultationcharges: {
//       type: Number,
//       required: true,
//     },
//     wellpathCharge: {
//       type: Number,
//       required: true,
//     },
//     NetFeeRecieved: {
//       type: Number,
//       required: true,
//     },
//     auth: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: Auth,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );
// // add plugin that converts mongoose to json
// consultationFee.plugin(toJSON);

// /**
//  * @typedef consultationFee
//  */
// const ConsultationFee = mongoose.model('ConsultationFee', consultationFee);

// module.exports = ConsultationFee;
