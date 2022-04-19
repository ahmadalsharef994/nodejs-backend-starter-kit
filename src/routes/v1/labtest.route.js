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
router.route('/thyrocare/labtests').get(labTestController.thyrocareLabTests);
// admin endpoint
router.route('/thyrocare/auto-update').get(authAdmin(), labTestController.startAutoUpdateCreds);
router
  .route('/thyrocare/pincode-availability')
  .post(validate(labTestValidator.pincode), labTestController.checkPincodeAvailability);
router.route('/thyrocare/pincode-details').post(validate(labTestValidator.pincode), labTestController.showPincodeDetails);
router.route('/thyrocare/test-details').post(validate(labTestValidator.testCode), labTestController.showTestDetails);
router
  .route('/thyrocare/slot-availability')
  .post(validate(labTestValidator.dateAvailability), labTestController.getAvailableTimeSlots);
router
  .route('/thyrocare/order-summary')
  .post(/* authUserDoctor(), */ validate(labTestValidator.orderSummary), labTestController.showOrderSummary);
router
  .route('/thyrocare/my-report')
  .post(/* authUserDoctor(), */ validate(labTestValidator.getMyReport), labTestController.showReport);
router
  .route('/thyrocare/guest-order')
  .post(/* authUserDoctor(), */ validate(labTestValidator.guestOrder), labTestController.postOrderData);
router
  .route('/thyrocare/resend-guestotp')
  .post(/* authUserDoctor(), */ validate(labTestValidator.resendGuestOtp), labTestController.resendGuestOtp);
router
  .route('/thyrocare/verify-order')
  .post(/* authUserDoctor(), */ validate(labTestValidator.verifyOrder), labTestController.verifyOrder);
router.route('/thyrocare/cart-value').post(validate(labTestValidator.cartValue), labTestController.cartValue);
router
  .route('/thyrocare/bookPrepaidOrder')
  .post(validate(labTestValidator.bookPrepaidOrder), labTestController.bookPrepaidOrder);
router
  .route('/thyrocare/:orderId')
  .post(/* authUserDoctor(), */ validate(labTestValidator.getGuestOrder), labTestController.showGuestOrder);

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
