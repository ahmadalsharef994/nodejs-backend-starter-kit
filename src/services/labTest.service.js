const { smsService, thyrocareServices } = require('../Microservices');
const generateOTP = require('../utils/generateOTP');
const { GuestOrder } = require('../models');

const getCartValue = async (cart) => {
  const labTests = await thyrocareServices.getSavedTestProducts();
  let totalAmount = 0;
  cart.forEach((item) => {
    totalAmount += parseInt(labTests.tests.find((test) => test.code === item.productCode).rate.b2C, 10) * item.quantity;
  });
  return totalAmount;
};

const initiateGuestBooking = async (customerDetails, testDetails, paymentDetails) => {
  const date = Date.now();
  const orderId = `MDZGX${Math.floor(Math.random() * 10)}${date.valueOf()}`;
  const OTP = generateOTP();
  const res = await smsService.sendPhoneOtp2F(customerDetails.mobile, OTP);
  const guestOrder = await GuestOrder.create({
    customerDetails,
    testDetails,
    paymentDetails,
    sessionId: res.data.Details,
    orderId,
  });
  return { sessionId: guestOrder.sessionId, orderId: guestOrder.orderId };
};

const postpaidOrder = async (orderDetails, paymentAmount) => {
  // post Order using thyrocare Order service
  const order = await thyrocareServices.postThyrocareOrder(
    orderDetails.orderId,
    orderDetails.customerDetails.name,
    orderDetails.customerDetails.age,
    orderDetails.customerDetails.gender,
    orderDetails.customerDetails.address,
    orderDetails.customerDetails.pincode,
    orderDetails.orderDetails.productCode,
    orderDetails.customerDetails.mobile,
    orderDetails.customerDetails.email,
    '', // remarks
    paymentAmount,
    orderDetails.testDetails.preferredTestDateTime,
    'N', // hardCopyReport
    'POSTPAID' // payment type
  );
  return order;
};

const verifyGuestOrder = async (sessionId, otp, orderId) => {
  let res = '';
  try {
    res = await smsService.verifyPhoneOtp2F(otp, sessionId);
  } catch (e) {
    return { Status: 'Failed', Details: "OTP Didn't Matched" };
  }
  const orderDetails = await GuestOrder.find({ sessionId, orderId });
  if (res.data.Status === 'Success') {
    if (orderDetails.paymentDetails.paymentType === 'POSTPAID') {
      const paymentAmount = await getCartValue([{ productCode: orderDetails.testDetails.productCode, quantity: 1 }]);

      const orderData = await postpaidOrder(orderDetails, paymentAmount);
      return orderData;
    }
    if (orderDetails.paymentDetails.paymentType === 'PREPAID') {
      return res.data; // order will be posted after razorpay payment
    }
  }
  return false;
};

module.exports = {
  initiateGuestBooking,
  verifyGuestOrder,
  postpaidOrder,
  getCartValue,
};

/*

const authFilter: function (req, res, next) {
    if (_.has(req.headers, 'token')) {
      if (req.headers.token != AUTH_KEY){
        req.error = new Error(tokenMissingMessage);
        exceptions.customException(req, res, tokenMissingMessage, 403);
      }
      else {
        next();
      }
    } else {
      req.error =  new Error(tokenMissingMessage);
      exceptions.customException(req, res, tokenMissingMessage, 403);
    }
  }
*/

/*
// {
//     "cart": [
//         {
//             "productCode": "",
//             "quantity": ""
//         },
//         {
//             "productCode": "",
//             "quantity": ""
//         }
//     ]
// }

{
    "totalAmount": ""
}
*/
