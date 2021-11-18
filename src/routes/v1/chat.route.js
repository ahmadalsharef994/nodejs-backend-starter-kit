const express = require('express');
const chatAuth = require('../../middlewares/chatAuth');
const validate = require('../../middlewares/validate');
const chatController = require('../../controllers/chat.controller');
const chatValidation = require('../../validations/chat.validation');

const router = express.Router();

router.route('/:appointmentId/get-messages').get(chatAuth(), validate(chatValidation.getChat), chatController.showChat);
router
  .route('/:appointmentId/send-message')
  .post(chatAuth(), validate(chatValidation.sendMessage), chatController.sendMessage);

module.exports = router;
