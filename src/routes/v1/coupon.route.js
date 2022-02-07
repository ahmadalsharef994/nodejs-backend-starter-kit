const express = require('express');
const { couponController } = require('../../controllers');

const router = express.Router();

router.route('/').get(couponController.showCoupons);

module.exports = router;
