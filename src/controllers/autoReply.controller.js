// const httpStatus = require('http-status');
// const catchAsync = require('../utils/catchAsync');
// const authService = require('../services/auth.service');
// const autoReplyService = require('../services/autoReply.service');

// const autoReplySymptoms = catchAsync(async (req, res) => {
//   const symptoms = req.body.symptoms;
//   const resultData = await autoReplyService.autoReplySymptoms(symptoms);
//   res.status(httpStatus.OK).json(resultData);
// });

// const autoReplyUser = catchAsync(async (req, res) => {
//   const AuthData = await authService.getAuthById(req.SubjectId);

//   const resultData = await autoReplyService.autoReplyUser(AuthData);
//   res.status(httpStatus.OK).json(resultData);
// });

// module.exports = {
//   autoReplyUser,
//   autoReplySymptoms,
// };
