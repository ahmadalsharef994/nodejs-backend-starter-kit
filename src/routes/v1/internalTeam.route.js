const express = require('express');
const validate = require('../../middlewares/validate');
const InternalTeamValidator = require('../../validations/internalTeam.validator');
const InternalTeamController = require('../../controllers/internalTeam.controller');
const authAdmin = require('../../middlewares/authAdmin');
const deviceauth = require('../../middlewares/deviceauth');
const labTestController = require('../../controllers/labtest.controller');

const router = express.Router();

/**
 * @openapi
 * /admin/restricted/thyrocare-login:
 *  get:
 *     tags:
 *     - admin
 *     - internal team
 */
router.route('/restricted/thyrocare-login').get(authAdmin(), labTestController.thyrocareLogin);

/**
 * @openapi
 * /admin/restricted/update-thyrocare-tests:
 *  get:
 *     tags:
 *     - admin
 *     - internal team
 */
router.route('/restricted/update-thyrocare-tests').get(authAdmin(), labTestController.updateThyrocareLabTests);
// for manually updating labtest packages
/**
 * @openapi
 * /admin/restricted/update-thyrocare-labtest-packages:
 *  get:
 *     tags:
 *     - admin
 *     - internal team
 */
router.route('/restricted/update-thyrocare-labtest-packages').get(authAdmin(), labTestController.updateLabTestPackages);

/**
 * @openapi
 * /admin/restricted/verifydoctor:
 *  post:
 *     tags:
 *     - admin
 *     - internal team
 */
router
  .route('/verifydoctor')
  .post(authAdmin(), validate(InternalTeamValidator.verifydoctor), InternalTeamController.verifydoctor);

/**
 * @openapi
 * /admin/restricted/rejectdoctor:
 *  post:
 *     tags:
 *     - admin
 *     - internal team
 */
router
  .route('/rejectdoctor')
  .post(authAdmin(), validate(InternalTeamValidator.rejectdoctor), InternalTeamController.rejectdoctor);

/**
 * @openapi
 * /admin/restricted/adminsignup:
 *  post:
 *     tags:
 *     - admin
 *     - internal team
 */
router
  .route('/restricted/adminsignup')
  .post(deviceauth(), validate(InternalTeamValidator.registeradmin), InternalTeamController.registeradmin);

/**
 * @openapi
 * /admin/restricted/adminsignin:
 *  post:
 *     tags:
 *     - admin
 *     - internal team
 */
router
  .route('/restricted/adminsignin')
  .post(deviceauth(), validate(InternalTeamValidator.loginadmin), InternalTeamController.loginadmin);

/**
 * @openapi
 * /admin/restricted/fetch-unverified-doctors:
 *  get:
 *     tags:
 *     - admin
 *     - internal team
 */
router.route('/fetch-unverified-doctors').get(authAdmin(), InternalTeamController.unverifiedDoctors);

/**
 * @openapi
 * /admin/restricted/fetch-unverified-doctors-profile:
 *  get:
 *     tags:
 *     - admin
 *     - internal team
 */
router.route('/fetch-unverified-doctors-profile').get(authAdmin(), InternalTeamController.Doctorsprofile);

/**
 * @openapi
 * /admin/restricted/verified-doctors:
 *  get:
 *     tags:
 *     - admin
 *     - internal team
 */
router.route('/verified-doctors').get(authAdmin(), InternalTeamController.verifiedDoctors);

/**
 * @openapi
 * /admin/restricted/rejected-doctors:
 *  get:
 *     tags:
 *     - admin
 *     - internal team
 */
router.route('/rejected-doctors').get(authAdmin(), InternalTeamController.rejectedDoctors);

/**
 * @openapi
 * /admin/restricted/service-charges:
 *  post:
 *     tags:
 *     - admin
 *     - internal team
 */
router
  .route('/service-charges')
  .post(authAdmin(), validate(InternalTeamValidator.setServiceCharges), InternalTeamController.setServiceCharges);

module.exports = router;
