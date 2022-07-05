const express = require('express');
const { couponController } = require('../../controllers');

const router = express.Router();
/**
 * @openapi
 * /coupons/:
 *  get:
 *     tags:
 *     - coupons
 */
router.route('/').get(couponController.showCoupons);

module.exports = router;
