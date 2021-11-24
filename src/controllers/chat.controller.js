const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const { chatService, authService } = require('../services');
const ApiError = require('../utils/ApiError');

const showChat = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const filter = pick(req.params.appointmentId, ['appointment']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  await chatService.getChat(req.params.appointmentId, AuthData, filter, options).then((result, err) => {
    if (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Not Authorized to Access this Chat');
    } else if (result.length === 0) {
      return res.status(httpStatus.OK).json({ message: 'No Messages Found', data: [] });
    }
    return res.status(httpStatus.OK).json({ message: 'Success', data: result });
  });
});

const sendMessage = catchAsync(async (req, res) => {
  if (!req.params.appointmentId === req.appointment) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Not Authorized to Access this Chat', data: [] });
  }
  if (req.entity === 'doctor') {
    await chatService.createMessage(req.appointment, req.doctor, req.body.text, req.body.attachment);
    return res.status(httpStatus.OK).json({ message: 'Success' });
  }
  if (req.entity === 'user') {
    await chatService.createMessage(req.appointment, req.user, req.body.text, req.body.attachment);
    return res.status(httpStatus.OK).json({ message: 'Success' });
  }
});

module.exports = {
  showChat,
  sendMessage,
};
