const express = require('express');
const validate = require('../../middlewares/validate');
const authuser = require('../../middlewares/authUser');
const { autoReplyValidation } = require('../../validations');
const { autoReplyController } = require('../../controllers');

const router = express.Router();

router.route('/user').post(authuser(), validate(autoReplyValidation.autoReplyUser), autoReplyController.autoReplyUser);

router
  .route('/symptoms')
  .post(authuser(), validate(autoReplyValidation.autoReplySymptoms), autoReplyController.autoReplySymptoms);

module.exports = router;

// Log Session Chat
// 1 sefice in db
// at least 2 code refactoring
