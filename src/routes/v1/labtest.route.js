const express = require('express');
const validate = require('../../middlewares/validate');
const labTestController = require('../../controllers/labtest.controller');
const labTestValidator = require('../../validations/labTest.validation');
const authAdmin = require('../../middlewares/authAdmin');
// const authUserDoctor = require('../../middlewares/authUserDoctor');

const router = express.Router();

// not in use
// router.route('/').get(labTestController.fetchAllLabtests);

// all endpoints are public

/**
 * @openapi
 * /thyrocare/labtests:
 *  post:
 *     tags:
 *     - thyrocare
 *     - no authentication
 */
router.route('/thyrocare/labtest-packages').get(labTestController.thyrocareLabTests);

/**
 * @openapi
 * /thyrocare/labtests:
 *  post:
 *     tags:
 *     - thyrocare
 *     - no authentication
 */
router.route('/thyrocare/labtest-packages').get(labTestController.getLabtestPackages);

// admin endpoints
/**
 * @openapi
 * /thyrocare/auto-update:
 *  post:
 *     tags:
 *     - thyrocare
 *     - admin
 */
router.route('/thyrocare/auto-update').get(authAdmin(), labTestController.startAutoUpdateCreds);

/**
 * @openapi
 * /thyrocare/pincode-availability:
 *  get:
 *     tags:
 *     - thyrocare
 *     - admin
 */
router
  .route('/thyrocare/pincode-availability')
  .post(validate(labTestValidator.pincode), labTestController.checkPincodeAvailability);

/**
 * @openapi
 * /thyrocare/auto-update:
 *  post:
 *     tags:
 *     - thyrocare
 *     - admin
 */
router.route('/thyrocare/pincode-details').post(validate(labTestValidator.pincode), labTestController.showPincodeDetails);

/**
 * @openapi
 * /thyrocare/auto-update:
 *  post:
 *     tags:
 *     - thyrocare
 *     - admin
 */
router.route('/thyrocare/test-details').post(validate(labTestValidator.testCode), labTestController.showTestDetails);

/**
 * @openapi
 * /thyrocare/auto-update:
 *  post:
 *     tags:
 *     - thyrocare
 *     - admin
 */
router
  .route('/thyrocare/slot-availability')
  .post(validate(labTestValidator.dateAvailability), labTestController.getAvailableTimeSlots);

/**
 * @openapi
 * /thyrocare/auto-update:
 *  post:
 *     tags:
 *     - thyrocare
 *     - admin
 */
router
  .route('/thyrocare/order-summary')
  .post(/* authUserDoctor(), */ validate(labTestValidator.orderSummary), labTestController.showOrderSummary);

/**
 * @openapi
 * /thyrocare/auto-update:
 *  post:
 *     tags:
 *     - thyrocare
 *     - admin
 */
router
  .route('/thyrocare/my-report')
  .post(/* authUserDoctor(), */ validate(labTestValidator.getMyReport), labTestController.getMyReport);

/**
 * @openapi
 * /thyrocare/auto-update:
 *  post:
 *     tags:
 *     - thyrocare
 *     - admin
 */
router
  .route('/thyrocare/guest-order')
  .post(/* authUserDoctor(), */ validate(labTestValidator.guestOrder), labTestController.postGuestOrder);

/**
 * @openapi
 * /thyrocare/auto-update:
 *  post:
 *     tags:
 *     - thyrocare
 *     - admin
 */
router
  .route('/thyrocare/resend-guestotp')
  .post(/* authUserDoctor(), */ validate(labTestValidator.resendGuestOtp), labTestController.resendGuestOtp);

/**
 * @openapi
 * /thyrocare/auto-update:
 *  post:
 *     tags:
 *     - thyrocare
 *     - admin
 */
router
  .route('/thyrocare/verify-order')
  .post(/* authUserDoctor(), */ validate(labTestValidator.verifyGuestOrder), labTestController.verifyGuestOrder);

/**
 * @openapi
 * /thyrocare/auto-update:
 *  post:
 *     tags:
 *     - thyrocare
 *     - admin
 */
router.route('/thyrocare/cart-value').post(validate(labTestValidator.cartValue), labTestController.cartValue);

// booking order
/**
 * @openapi
 * /thyrocare/auto-update:
 *  post:
 *     tags:
 *     - thyrocare
 *     - admin
 */
router
  .route('/thyrocare/bookPrepaidOrder')
  .post(validate(labTestValidator.bookPrepaidOrder), labTestController.bookPrepaidOrder);

/**
 * @openapi
 * /thyrocare/auto-update:
 *  post:
 *     tags:
 *     - thyrocare
 *     - admin
 */
router
  .route('/thyrocare/:orderId')
  .post(/* authUserDoctor(), */ validate(labTestValidator.getGuestOrder), labTestController.getGuestOrder);

/* currently not supported by thyrocare */
// router
//   .route('/thyrocare/reschedule-order')
//   .post(/* authUserDoctor(), */ validate(labTestValidator.rescheduleOrder), labTestController.rescheduleOrder);
// router
//   .route('thyrocare-cancel-order')
//   .post(authUserDoctor(), validate(labTestValidator.cancelOrder), labTestController.cancelOrder);
// router
//   .route('/thyrocare/fix-slot')
//   .post(/* authUserDoctor(), */ validate(labTestValidator.fixSlot), labTestController.fixTimeSlot);

module.exports = router;
