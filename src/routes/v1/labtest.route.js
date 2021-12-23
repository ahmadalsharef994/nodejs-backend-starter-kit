const express = require('express');
const LabtestController = require('../../controllers/labtest.controller');

const router = express.Router();

router.route('/').get(LabtestController.fetchAllLabtests);

router.route('/post-order').post(LabtestController.postOrderData);
router.route('/pincode-availability').post(LabtestController.checkPincodeAvailability);
router.route('/timeslot-availability').post(LabtestController.getAvailableTimeSlots);
module.exports = router;
