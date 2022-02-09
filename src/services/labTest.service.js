const httpStatus = require('http-status');
const short = require('short-uuid');
const fs = require('fs');
const { smsService, thyrocareServices } = require('../Microservices');
const generateOTP = require('../utils/generateOTP');
const ApiError = require('../utils/ApiError');
const { GuestOrder, ThyrocareOrder, RazorpayPayment } = require('../models');
const coupons = require('../assets/coupons.json');

const getGuestOrder = async (orderID) => {
  const orderSummary = await GuestOrder.findOne({ orderId: orderID });
  if (orderSummary === null) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  const { cart, homeCollectionFee, totalCartAmount, customerDetails, testDetails, paymentDetails, orderId } =
    await orderSummary;

  // getting full test name
  const labTests = await thyrocareServices.getSavedTestProducts();
  const products = [];
  cart.forEach((item) => {
    const product = labTests.tests.find((test) => test.code === item.productCode);
    products.push(product.name);
  });

  // splitting date and time
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

const getCartValue = async (cart, couponCode) => {
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

  // console.log('couponcode: ', couponCode);
  // implement coupon code if given
  if (couponCode) {
    const coupon = coupons.find((obj) => obj.code === couponCode);
    // console.log('coupon: ', coupon);
    if (coupon) {
      const expiryTime = new Date(coupon.expiresOn);
      const time = expiryTime.getTime() - new Date().getTime();
      // console.log(time);
      if (time > 0) {
        // apply coupon
        // console.log('coupon applied');
        totalCartAmount =
          coupon.discountPercent !== null
            ? (totalCartAmount / 100) * coupon.discountPercent
            : totalCartAmount - coupon.discountFlat;
        return { cartDetails, homeCollectionFee, totalCartAmount, message: 'Coupon Applied' };
      }
      // console.log('coupon expired');
      // coupon expired
      return { cartDetails, homeCollectionFee, totalCartAmount, message: 'Coupon Expired' };
    }
    // console.log('coupon not found');
    // coupon not found
    return { cartDetails, homeCollectionFee, totalCartAmount, message: 'Coupon Not Found' };
  }
  // console.log('coupon not passed');
  // No coupons passed
  return { cartDetails, homeCollectionFee, totalCartAmount, message: 'No Coupon' };
};

const initiateGuestBooking = async (customerDetails, testDetails, paymentDetails, cart, couponCode) => {
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
  try {
    const res = await smsService.sendPhoneOtp2F(customerDetails.mobile, OTP, 'Booking Confirmation');
    const guestOrder = await GuestOrder.create({
      customerDetails,
      testDetails,
      paymentDetails,
      sessionId: res.data.Details,
      orderId,
      cart,
      couponCode,
    });
    return { sessionId: guestOrder.sessionId, orderId: guestOrder.orderId };
  } catch (e) {
    return false;
  }
};

const prepaidOrder = async (razorpayOrderID, labTestOrderID) => {
  const orderDetails = await GuestOrder.findOne({ orderId: labTestOrderID });
  const paymentDetails = await RazorpayPayment.findOne({ razorpayOrderID, labTestOrderID });
  if (paymentDetails) {
    if (orderDetails && paymentDetails.isPaid === true) {
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

const getPincodeDetails = async (pincode) => {
  try {
    const pincodeBuffer = fs.readFileSync('src/assets/pincode.json');
    const allPincodes = await JSON.parse(pincodeBuffer);
    const result = await allPincodes.find((pinData) => pinData.Pincode === parseInt(pincode, 10));
    // console.log(allPincodes.length);  total = 39734
    return result;
  } catch (e) {
    return false;
  }
};

const getLabTestDetails = async (testCode) => {
  try {
    const labTestDetailsBuffer = fs.readFileSync('src/assets/labTestDetails.json');
    const allTestDetails = await JSON.parse(labTestDetailsBuffer);
    const result = await allTestDetails.find((test) => test['Test Code'] === testCode);
    return result;
  } catch (e) {
    return false;
  }
};

const resetGuestOtp = async (orderId) => {
  const order = await GuestOrder.findOne({ orderId });
  if (order === null) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order Not Found');
  }
  const OTP = generateOTP();
  try {
    const res = await smsService.sendPhoneOtp2F(order.customerDetails.mobile, OTP, 'Booking Confirmation');
    const updatedOrder = await GuestOrder.findOneAndUpdate(
      { orderId },
      { $set: { sessionId: res.data.Details } },
      { new: true }
    );
    return { sessionId: updatedOrder.sessionId, orderId: updatedOrder.orderId };
  } catch (e) {
    return false;
  }
};

module.exports = {
  initiateGuestBooking,
  verifyGuestOrder,
  postpaidOrder,
  getCartValue,
  prepaidOrder,
  getGuestOrder,
  getPincodeDetails,
  resetGuestOtp,
  getLabTestDetails,
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
