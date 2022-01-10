const httpStatus = require('http-status');
const short = require('short-uuid');
const { smsService, thyrocareServices } = require('../Microservices');
const generateOTP = require('../utils/generateOTP');
const ApiError = require('../utils/ApiError');
const { GuestOrder, ThyrocareOrder } = require('../models');

const getGuestOrder = async (orderID) => {
  const { cart, homeCollectionFee, totalCartAmount, customerDetails, testDetails, paymentDetails, orderId } =
    await GuestOrder.findOne({ orderId: orderID });
  const labTests = await thyrocareServices.getSavedTestProducts();
  const products = [];
  cart.forEach((item) => {
    const product = labTests.tests.find((test) => test.code === item.productCode);
    products.push(product.name);
  });
  const dateTimeArr = testDetails.preferredTestDateTime.split(' ');
  const date = dateTimeArr[0];
  const time = `${dateTimeArr[1]} ${dateTimeArr[2]}`;
  return {
    orderId,
    customerDetails,
    products,
    date,
    time,
    paymentType: paymentDetails.paymentType,
    homeCollectionFee,
    totalAmount: totalCartAmount,
  };
};

const getCartValue = async (cart) => {
  const labTests = await thyrocareServices.getSavedTestProducts();
  const cartDetails = [];
  let totalCartAmount = 0;
  await cart.forEach((item) => {
    totalCartAmount += parseInt(labTests.tests.find((test) => test.code === item.productCode).rate, 10) * item.quantity;
    cartDetails.push({
      rate: parseInt(labTests.tests.find((test) => test.code === item.productCode).rate, 10),
      code: item.productCode,
      quantity: item.quantity,
    });
  });
  const homeCollectionFee = totalCartAmount < 300 ? 200 : 0;
  totalCartAmount += homeCollectionFee;
  return { cartDetails, homeCollectionFee, totalCartAmount };
};

const initiateGuestBooking = async (customerDetails, testDetails, paymentDetails, cart) => {
  const currentDate = new Date();
  const bookingDate = new Date(testDetails.preferredTestDateTime);
  const timeDifference = bookingDate.getTime() - currentDate.getTime();
  const differenceInDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
  if (differenceInDays > 7) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You can only book for 7 days in advance.');
  } else if (differenceInDays < 1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You're providing a past date for booking");
  }
  const orderId = `MDZGX${Math.floor(Math.random() * 10)}${short.generate().toUpperCase()}`;
  const OTP = generateOTP();
  const res = await smsService.sendPhoneOtp2F(customerDetails.mobile, OTP, 'Booking Confirmation');
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

const prepaidOrder = async (orderId, sessionId) => {
  const orderDetails = await GuestOrder.findOne({ sessionId, orderId });
  if (orderDetails) {
    const { cartDetails, homeCollectionFee, totalCartAmount } = await getCartValue(orderDetails.cart);
    let finalProductCode = '';
    // generating multiple order string
    for (let i = 0; i < cartDetails.length; i += 1) {
      finalProductCode += cartDetails[i].code;
      finalProductCode = i < cartDetails.length - 1 ? `${finalProductCode},` : finalProductCode;
    }

    const orderSummary = await thyrocareServices.postThyrocareOrder(
      orderDetails.sessionId,
      orderDetails.orderId,
      orderDetails.customerDetails.name,
      orderDetails.customerDetails.age,
      orderDetails.customerDetails.gender,
      orderDetails.customerDetails.address,
      orderDetails.customerDetails.pincode,
      finalProductCode,
      orderDetails.customerDetails.mobile,
      orderDetails.customerDetails.email,
      '', // remarks
      totalCartAmount,
      orderDetails.testDetails.preferredTestDateTime,
      'N', // hardCopyReport
      'PREPAID' // paymentType
    );

    const collectionDateTime = orderDetails.testDetails.preferredTestDateTime.split(' ');

    const orderData = {
      response: orderSummary.response,
      orderId: orderSummary.orderNo,
      product: orderSummary.product,
      customerDetails: orderDetails.customerDetails,
      date: collectionDateTime[0],
      time: `${collectionDateTime[1]} ${collectionDateTime[2]}`,
      paymentMode: 'PAID',
      homeCollectionFee,
      totalCartAmount,
    };
    return { isOrderPlaced: true, orderData };
  }
  return { isOrderPlaced: false, orderData: null };
};

const postpaidOrder = async (orderDetails) => {
  const { cartDetails, homeCollectionFee, totalCartAmount } = await getCartValue(orderDetails.cart);
  // updating guestOrderDetais
  await GuestOrder.findOneAndUpdate({ orderId: orderDetails.orderId }, { $set: { homeCollectionFee, totalCartAmount } });
  let finalProductCode = '';
  // generating multiple order string
  for (let i = 0; i < cartDetails.length; i += 1) {
    finalProductCode += cartDetails[i].code;
    finalProductCode = i < cartDetails.length - 1 ? `${finalProductCode},` : finalProductCode;
  }

  const orderSummary = await thyrocareServices.postThyrocareOrder(
    orderDetails.sessionId,
    orderDetails.orderId,
    orderDetails.customerDetails.name,
    orderDetails.customerDetails.age,
    orderDetails.customerDetails.gender,
    orderDetails.customerDetails.address,
    orderDetails.customerDetails.pincode,
    finalProductCode,
    orderDetails.customerDetails.mobile,
    orderDetails.customerDetails.email,
    '', // remarks
    totalCartAmount,
    orderDetails.testDetails.preferredTestDateTime,
    'N', // hardCopyReport
    'POSTPAID' // paymentType
  );

  const collectionDateTime = orderDetails.testDetails.preferredTestDateTime.split(' ');

  return {
    response: orderSummary.response,
    orderId: orderSummary.orderNo,
    product: orderSummary.product,
    customerDetails: orderDetails.customerDetails,
    date: collectionDateTime[0],
    time: `${collectionDateTime[1]} ${collectionDateTime[2]}`,
    paymentMode: 'COD',
    homeCollectionFee,
    totalCartAmount,
  };
};

const verifyGuestOrder = async (sessionId, otp, orderId) => {
  let verifyOtpRes = '';
  try {
    verifyOtpRes = await smsService.verifyPhoneOtp2F(otp, sessionId);
  } catch (e) {
    return { Status: 'Failed', Details: "OTP Didn't Matched" };
  }

  const orderExist = await ThyrocareOrder.findOne({ orderNo: orderId });
  if (orderExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Order Already Placed');
  }

  const orderDetails = await GuestOrder.findOne({ sessionId, orderId });
  if (verifyOtpRes.data.Status === 'Success' && orderDetails) {
    if (orderDetails.paymentDetails.paymentType === 'POSTPAID') {
      const orderData = await postpaidOrder(orderDetails);
      return { isOrderPlaced: true, orderData };
    }
    if (orderDetails.paymentDetails.paymentType === 'PREPAID') {
      return { isOrderPlaced: false, orderData: verifyOtpRes.data };
    }
  }
  return { isOrderPlaced: false, orderData: null };
};

module.exports = {
  initiateGuestBooking,
  verifyGuestOrder,
  postpaidOrder,
  getCartValue,
  prepaidOrder,
  getGuestOrder,
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
