// const mongoose = require('mongoose');
// const { toJSON, paginate } = require('./plugins');
// const Auth = require('./auth.model');

// const DoctorQuerySchema = mongoose.Schema(
//   {
//     AuthDoctor: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: Auth,
//       required: true,
//     },
//     ticketNumber: {
//       type: String,
//       required: true,
//     },
//     issue: {
//       type: String,
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//     },
//     ticketStatus: {
//       type: String,
//       required: true,
//       default: 'open',
//     },
//   },
//   {
//     timestamps: true,
//   }
// );
// /**
//  * @typedef DoctorQueries
//  */
// // add plugin that converts mongoose to json
// DoctorQuerySchema.plugin(toJSON);
// DoctorQuerySchema.plugin(paginate);

// const DoctorQueries = mongoose.model('DoctorQueries', DoctorQuerySchema);

// module.exports = DoctorQueries;
