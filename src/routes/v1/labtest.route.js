const express = require('express');
const validate = require('../../middlewares/validate');
const labTestController = require('../../controllers/labtest.controller');
const labTestValidator = require('../../validations/labTest.validation');

const router = express.Router();

router.route('/').get(labTestController.fetchAllLabtests);

// currently public endpoint
router.route('/thyrocare/post-order').post(validate(labTestValidator.thyrocareOrder), labTestController.postOrderData);
router
  .route('/thyrocare/pincode-availability')
  .post(validate(labTestValidator.PincodeAvailability), labTestController.checkPincodeAvailability);
router
  .route('/thyrocare/timeslot-availability')
  .post(validate(labTestValidator.dateAvailability), labTestController.getAvailableTimeSlots);

module.exports = router;
