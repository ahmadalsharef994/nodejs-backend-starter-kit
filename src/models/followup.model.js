// const mongoose = require('mongoose');
// const { toJSON, paginate } = require('./plugins');
// const Appointment = require('./auth.model');

// const FollowupSchema = mongoose.Schema(
//   {
//     Appointment: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: Appointment,
//       required: true,
//       index: true,
//     },
//     isRescheduled: {
//       type: Boolean,
//       default: false,
//     },
//     patientName: {
//       type: String,
//       required: true,
//     },
//     orderId: {
//       type: String,
//       required: true,
//     },
//     docid: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     slotId: {
//       type: String,
//       required: true,
//     },
//     StartTime: {
//       type: Date,
//       required: true,
//       index: true,
//     },
//     EndTime: {
//       type: Date,
//       required: true,
//     },
//     Gender: {
//       type: String,
//       required: true,
//       default: 'Not Mentioned',
//     },
//     HealthIssue: {
//       type: String,
//       required: true,
//     },
//     Date: {
//       type: String,
//       required: true,
//     },
//     FollowupNo: {
//       type: Number,
//       required: true,
//     },
//     FollowupDocs: {
//       type: Array,
//       default: null,
//     },
//     Status: {
//       type: String,
//       required: true,
//     },
//     AuthUser: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: Appointment,
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // add plugin that converts mongoose to json
// FollowupSchema.plugin(toJSON);
// FollowupSchema.plugin(paginate);
// /**
//  * @typedef Followup
//  */

// const Followup = mongoose.model('Followup', FollowupSchema);

// module.exports = Followup;
