// const mongoose = require('mongoose');
// const { toJSON } = require('./plugins');
// const Appointment = require('./auth.model');

// const DoctorRequestSchema = mongoose.Schema(
//   {
//     Appointment: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: Appointment,
//       required: true,
//     },
//     Type: {
//       type: String,
//       required: true,
//     },
//     Status: {
//       type: String,
//       required: true,
//     },
//     StartTime: {
//       type: Date,
//       required: true,
//     },
//     EndTime: {
//       type: Date,
//       required: true,
//     },
//     UserDenied: {
//       type: Boolean,
//       required: true,
//       default: false,
//     },
//     UserRescheduled: {
//       type: Boolean,
//       required: true,
//       default: false,
//     },
//     UserSelectedSlot: {
//       type: String,
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // add plugin that converts mongoose to json
// DoctorRequestSchema.plugin(toJSON);
// /**
//  * @typedef DoctorRequest
//  */

// const DoctorRequest = mongoose.model('DoctorRequest', DoctorRequestSchema);

// module.exports = DoctorRequest;
