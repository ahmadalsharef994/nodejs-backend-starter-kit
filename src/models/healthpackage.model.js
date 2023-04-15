// /* eslint-disable prettier/prettier */
// const mongoose = require('mongoose');
// const { toJSON } = require('./plugins');
// const Auth = require('./auth.model');

// const healthpackageSchema = mongoose.Schema(
//   {
//     packagePrice: {
//       type: Number,
//       required: true,
//     },
//     packageName: {
//       type: String,
//       required: true,
//     },
//     TypesofTests: {
//       type: Array,
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
// healthpackageSchema.plugin(toJSON);

// /**
//  * @typedef HealthPackage
//  */
// const HealthPackage = mongoose.model('HealthPackage', healthpackageSchema);

// module.exports = HealthPackage;
