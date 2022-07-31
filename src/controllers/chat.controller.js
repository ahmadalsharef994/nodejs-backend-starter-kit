const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { chatService, authService } = require('../services');
const ApiError = require('../utils/ApiError');

const getMessages = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);

  await chatService.getMessages(req.params.appointmentId, AuthData).then((result, err) => {
    if (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Not Authorized to Access this Chat');
    }
    return res.status(httpStatus.OK).json({ message: 'Success', data: result });
  });
});

module.exports = {
  getMessages,
  // sendMessage,
};
