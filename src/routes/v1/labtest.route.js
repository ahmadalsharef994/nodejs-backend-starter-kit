const express = require('express');
const validate = require('../../middlewares/validate');
const labTestController = require('../../controllers/labtest.controller');
const labTestValidator = require('../../validations/labTest.validation');
const authUserDoctor = require('../../middlewares/authUserDoctor');

const router = express.Router();

router.route('/').get(labTestController.fetchAllLabtests);

router
  .route('/thyrocare/post-order')
  .post(authUserDoctor(), validate(labTestValidator.thyrocareOrder), labTestController.postOrderData);
router
  .route('/thyrocare/pincode-availability')
  .post(authUserDoctor(), validate(labTestValidator.PincodeAvailability), labTestController.checkPincodeAvailability);
router
  .route('/thyrocare/slot-availability')
  .post(authUserDoctor(), validate(labTestValidator.dateAvailability), labTestController.getAvailableTimeSlots);
router
  .route('/thyrocare/fix-slot')
  .post(authUserDoctor(), validate(labTestValidator.fixSlot), labTestController.getAvailableTimeSlots);
router
  .route('/thyrocare/order-summary')
  .post(authUserDoctor(), validate(labTestValidator.orderSummary), labTestController.showOrderSummary);
router
  .route('/thyrocare/my-report')
  .post(authUserDoctor(), validate(labTestValidator.getMyReport), labTestController.showReport);

// cancel order currently not supported by thyrocare
// router.route('thyrocare-cancel-order').post(validate(labTestValidator.cancelOrder), labTestController.cancelOrder);

router
  .route('/thyrocare/reschedule-order')
  .post(authUserDoctor(), validate(labTestValidator.rescheduleOrder), labTestController.rescheduleOrder);

module.exports = router;
