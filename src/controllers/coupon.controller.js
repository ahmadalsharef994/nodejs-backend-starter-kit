const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { couponService } = require('../services');

const showCoupons = catchAsync(async (req, res) => {
  const coupons = await couponService.getAllCoupons();
  if (coupons.length) {
    return res.status(httpStatus.OK).json({ message: 'Success', data: coupons });
  }
  return res.status(httpStatus.NOT_FOUND).json({ message: 'No Coupons found' });
});

module.exports = {
  showCoupons,
};
