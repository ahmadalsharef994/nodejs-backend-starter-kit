const express = require('express');
const validate = require('../../middlewares/validate');
const InternalTeamValidator = require('../../validations/internalTeam.validator');
const InternalTeamController = require('../../controllers/internalTeam.controller');
const authAdmin = require('../../middlewares/authAdmin');
const deviceauth = require('../../middlewares/deviceauth');
const labTestController = require('../../controllers/labtest.controller');

const router = express.Router();

router.route('/restricted/thyrocare-login').get(authAdmin(), labTestController.thyrocareLogin);
router.route('/restricted/update-thyrocare-tests').get(authAdmin(), labTestController.updateThyrocareLabTests);
router
  .route('/verifydoctor')
  .post(authAdmin(), validate(InternalTeamValidator.verifydoctor), InternalTeamController.verifydoctor);
router
  .route('/rejectdoctor')
  .post(authAdmin(), validate(InternalTeamValidator.rejectdoctor), InternalTeamController.rejectdoctor);
router
  .route('/restricted/adminsignup')
  .post(deviceauth(), validate(InternalTeamValidator.registeradmin), InternalTeamController.registeradmin);
router
  .route('/restricted/adminsignin')
  .post(deviceauth(), validate(InternalTeamValidator.loginadmin), InternalTeamController.loginadmin);
router
  .route('/add-doctors-to-model')
  .post(authAdmin(), validate(InternalTeamValidator.doctordetails), InternalTeamController.addDoctorDetails);
router.route('/fetch-unverified-doctors').get(authAdmin(), InternalTeamController.unverifiedDoctors);
router.route('/fetch-unverified-doctors-profile').get(authAdmin(), InternalTeamController.Doctorsprofile);
module.exports = router;
