// const mongoose = require('mongoose');
// const { toJSON } = require('./plugins');

// const thyrocareTokenSchema = mongoose.Schema(
//   {
//     thyroAccessToken: {
//       type: String,
//       required: true,
//     },
//     thyroApiKey: {
//       type: String,
//       required: true,
//     },
//     identifier: {
//       type: String,
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // add plugin that converts mongoose to json
// thyrocareTokenSchema.plugin(toJSON);

// /**
//  * @typedef Token
//  */
// const ThyrocareToken = mongoose.model('ThyrocareToken', thyrocareTokenSchema);

// module.exports = ThyrocareToken;
