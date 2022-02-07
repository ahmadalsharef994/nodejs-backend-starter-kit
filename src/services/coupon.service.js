// const httpStatus = require('http-status');
const fs = require('fs');
// const ApiError = require('../utils/ApiError');
// const { GuestOrder } = require('../models');

const getAllCoupons = async () => {
  try {
    const couponBuffer = fs.readFileSync('src/assets/coupons.json');
    const allCoupons = await JSON.parse(couponBuffer);
    return allCoupons;
  } catch (e) {
    return [];
  }
};

module.exports = {
  getAllCoupons,
};
