const httpStatus = require('http-status');
const { smsService, thyrocareServices } = require('../Microservices');
const generateOTP = require('../utils/generateOTP');
const ApiError = require('../utils/ApiError');
const { GuestOrder } = require('../models');

const getCartValue = async (cart) => {
  const labTests = await thyrocareServices.getSavedTestProducts();
  const cartDetails = [];
  let totalCartAmount = 0;
  cart.forEach((item) => {
    let currentAmount = parseInt(labTests.tests.find((test) => test.code === item.productCode).rate, 10);
    currentAmount = currentAmount < 300 ? currentAmount + 200 : currentAmount;
    const homeCollectionFee = currentAmount < 300 ? 200 : 0;
    totalCartAmount += currentAmount;
    cartDetails.push({
      rate: parseInt(labTests.tests.find((test) => test.code === item.productCode).rate, 10),
      homeCollectionFee,
      code: item.productCode,
      quantity: item.quantity,
    });
  });

  return { cartDetails, totalCartAmount };
};

const initiateGuestBooking = async (customerDetails, testDetails, paymentDetails, cart) => {
  const currentDate = new Date();
  const bookingDate = new Date(testDetails.preferredTestDateTime);
  const timeDifference = bookingDate.getTime() - currentDate.getTime();
  const differenceInDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
  if (differenceInDays > 7) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'You can only book for 7 days in advance. Please select the date according to it.'
    );
  }
  const orderId = `MDZGX${Math.floor(Math.random() * 10)}${currentDate.valueOf()}`;
  const OTP = generateOTP();
  const res = await smsService.sendPhoneOtp2F(customerDetails.mobile, OTP);
  const guestOrder = await GuestOrder.create({
    customerDetails,
    testDetails,
    paymentDetails,
    sessionId: res.data.Details,
    orderId,
    cart,
  });
  return { sessionId: guestOrder.sessionId, orderId: guestOrder.orderId };
};

const postpaidOrder = async (orderDetails) => {
  const { cartDetails, totalCartAmount } = await getCartValue(orderDetails.cart);
  for (let i = 0; i < cartDetails.length; i += 1) {
    const currentDate = new Date();
    const thyrocareOrderId = `MDZGX${Math.floor(Math.random() * 10)}${currentDate.valueOf()}`;
    // eslint-disable-next-line no-await-in-loop
    await thyrocareServices.postThyrocareOrder(
      orderDetails.sessionId,
      thyrocareOrderId,
      orderDetails.customerDetails.name,
      orderDetails.customerDetails.age,
      orderDetails.customerDetails.gender,
      orderDetails.customerDetails.address,
      orderDetails.customerDetails.pincode,
      cartDetails[i].code,
      orderDetails.customerDetails.mobile,
      orderDetails.customerDetails.email,
      '', // remarks
      cartDetails[i].rate,
      orderDetails.testDetails.preferredTestDateTime,
      'N', // hardCopyReport
      orderDetails.paymentDetails.paymentType
    );
  }
  return { orderId: orderDetails.orderId, collectionTime: orderDetails.testDetails.preferredTestDateTime, totalCartAmount };
};

const verifyGuestOrder = async (sessionId, otp, orderId) => {
  let res = '';
  try {
    res = await smsService.verifyPhoneOtp2F(otp, sessionId);
  } catch (e) {
    return { Status: 'Failed', Details: "OTP Didn't Matched" };
  }
  const orderDetails = await GuestOrder.findOne({ sessionId, orderId });
  if (res.data.Status === 'Success' && orderDetails) {
    if (orderDetails.paymentDetails.paymentType === 'POSTPAID') {
      const orderData = await postpaidOrder(orderDetails);
      return { isOrderPlaced: true, orderData };
    }
    if (orderDetails.paymentDetails.paymentType === 'PREPAID') {
      return { isOrderPlaced: false, orderData: res.data };
    }
  }
  return { isOrderPlaced: false, orderData: null };
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
