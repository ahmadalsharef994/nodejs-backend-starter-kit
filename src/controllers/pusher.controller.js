// const httpStatus = require('http-status');
// const catchAsync = require('../utils/catchAsync');
// const pusherService = require('../Microservices/pusherService');

// const pusherAuthenticate = catchAsync(async (req, res) => {
//   const socketId = req.body.socket_id;
//   const channel = req.body.channel_name;
//   const auth = await pusherService.pusherAuthenticate(channel, socketId);
//   return res.status(httpStatus.OK).json(auth);
// });

// module.exports = {
//   pusherAuthenticate,
// };
