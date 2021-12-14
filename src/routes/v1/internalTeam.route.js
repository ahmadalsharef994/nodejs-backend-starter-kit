const express = require('express');
const validate = require('../../middlewares/validate');
const InternalTeamValidator = require('../../validations/internalTeam.validator');
const InternalTeamController = require('../../controllers/internalTeam.controller');
const authAdmin = require('../../middlewares/authAdmin');
const deviceauth = require('../../middlewares/deviceauth');
const LabtestController = require('../../controllers/labtest.controller');

const router = express.Router();

router
  .route('/verifydoctor')
  .post(authAdmin(), validate(InternalTeamValidator.verifydoctor), InternalTeamController.verifydoctor);
router
  .route('/rejectdoctor')
  .post(authAdmin(), validate(InternalTeamValidator.rejectdoctor), InternalTeamController.rejectdoctor);
router.post(
  '/restricted/adminsignup',
  deviceauth(),
  validate(InternalTeamValidator.registeradmin),
  InternalTeamController.registeradmin
);
router.post(
  '/restricted/adminsignin',
  deviceauth(),
  validate(InternalTeamValidator.loginadmin),
  InternalTeamController.loginadmin
);
router.route('/restricted/thyrocare-login').post(LabtestController.thyrocareLogin);

module.exports = router;
