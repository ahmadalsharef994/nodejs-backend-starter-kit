// const mongoose = require('mongoose');
// const { toJSON } = require('./plugins');
// const Auth = require('./auth.model');

// const DoctorEducationSchema = mongoose.Schema(
//   {
//     registrationNo: {
//       type: String,
//       required: true,
//     },
//     yearofRegistration: {
//       type: Number,
//       required: true,
//     },
//     stateMedicalCouncil: {
//       type: String,
//       required: true,
//     },
//     isEducationVerified: {
//       type: Boolean,
//       default: false,
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
// DoctorEducationSchema.plugin(toJSON);

// /**
//  * @typedef DoctorEducation
//  */
// const DoctorEducation = mongoose.model('DoctorEducation', DoctorEducationSchema);

// module.exports = DoctorEducation;
