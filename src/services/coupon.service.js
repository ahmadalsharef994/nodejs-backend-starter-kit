// // const httpStatus = require('http-status');
// const fs = require('fs');
// // const ApiError = require('../utils/ApiError');
// // const { GuestOrder } = require('../models');

// const getAllCoupons = async () => {
//   try {
//     const couponBuffer = fs.readFileSync('src/assets/coupons.json');
//     const allCoupons = await JSON.parse(couponBuffer);
//     // eslint-disable-next-line array-callback-return
//     const validcoupouns = allCoupons.filter((coupon) => {
//       const expiryTime = new Date(coupon.expiresOn);
//       const time = expiryTime.getTime() - new Date().getTime();
//       if (time > 0 || coupon.expiresOn === null) {
//         return true;
//       }
//       return false;
//     });
//     return validcoupouns;
//   } catch (e) {
//     return [];
//   }
// };

// module.exports = {
//   getAllCoupons,
// };
