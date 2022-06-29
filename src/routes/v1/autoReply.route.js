const express = require('express');
const validate = require('../../middlewares/validate');
const authuser = require('../../middlewares/authUser');
const { autoReplyValidation } = require('../../validations');
const { autoReplyController } = require('../../controllers');

const router = express.Router();
/**
 * @openapi
 * /autoreply/user:
 *  post:
 *     tags:
 *     - autoreply
 */
router.route('/user').post(authuser(), validate(autoReplyValidation.autoReplyUser), autoReplyController.autoReplyUser);
/**
 * @openapi
 * /autoreply/symptoms:
 *  post:
 *     tags:
 *     - autoreply
 */
router
  .route('/symptoms')
  .post(authuser(), validate(autoReplyValidation.autoReplySymptoms), autoReplyController.autoReplySymptoms);

module.exports = router;

// Log Session Chat
