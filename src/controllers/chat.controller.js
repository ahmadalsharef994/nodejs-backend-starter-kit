const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { chatService } = require('../services');

const showChat = catchAsync(async (req, res) => {
  if (!req.params.appointmentId === req.appointment) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Not Authorized to Access this Chat', data: [] });
  }
  await chatService.getChat(req.appointment).then((result) => {
    if (result === null) {
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
    await chatService.sendMessage(req.appointment, req.doctor, req.body.text, req.body.attachment).then((result) => {
      return res.status(httpStatus.OK).json({ message: 'Success', data: result });
    });
  } else if (req.entity === 'user') {
    await chatService.sendMessage(req.appointment, req.user, req.body.text, req.body.attachment).then((result) => {
      return res.status(httpStatus.OK).json({ message: 'Success', data: result });
    });
  }
});

module.exports = {
  showChat,
  sendMessage,
};
