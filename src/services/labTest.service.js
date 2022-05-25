const httpStatus = require('http-status');
const short = require('short-uuid');
const fs = require('fs');
const { smsService, thyrocareServices } = require('../Microservices');
const generateOTP = require('../utils/generateOTP');
const ApiError = require('../utils/ApiError');
const { GuestOrder, ThyrocareOrder, LabtestOrder } = require('../models');
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
// checks if a product exists in labtestCollection
const checkproductCodes = async (cart) => {
  const labTests = await thyrocareServices.getSavedTestProducts();
  let response = true;
  let Item = '';
  await cart.forEach((item) => {
    const res = labTests.tests.find((test) => test.code === item.productCode);
    if (res === undefined) {
      response = false;
      Item = item;
    }
  });
  return { response, Item };
};
// caluclates cart value
const getCartValue = async (cart, couponCode) => {
  const labTests = await thyrocareServices.getSavedTestProducts();
  const isproductexist = await checkproductCodes(cart);
  if (isproductexist.response === false) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `invalid product code : ${isproductexist.Item.productCode}.Product doesn't exist`
    );
  }
  const cartDetails = [];
  let totalCartAmount = 0;
  await cart.forEach((item) => {
    totalCartAmount += parseInt(labTests.tests.find((test) => test.code === item.productCode).rate, 10) * item.quantity;
    const eachItemPrice = parseInt(labTests.tests.find((test) => test.code === item.productCode).rate, 10);
    cartDetails.push({
      rate: eachItemPrice,
      code: item.productCode,
      quantity: item.quantity,
    });
  });
  let homeCollectionFee = 0;
  // implement coupon code if given
  if (couponCode) {
    totalCartAmount = 0;
    // eslint-disable-next-line prefer-const
    let Cart = [];
    let totalAmount = 0;
    const coupon = coupons.find((obj) => obj.code === couponCode);
    if (coupon) {
      const expiryTime = new Date(coupon.expiresOn);
      const time = expiryTime.getTime() - new Date().getTime();
      if (time > 0) {
        // apply coupon
        let discount = 0;
        if (coupon.discountPercent) {
          // eslint-disable-next-line no-plusplus
          for (let index = 0; index < cartDetails.length; index++) {
            totalAmount += cartDetails[index].rate;
            let displayPrice = Math.round(
              cartDetails[index].rate - (coupon.discountPercent / 100) * cartDetails[index].rate
            );

            if (coupon.discountPercent >= 50) {
              if (displayPrice > 1000) {
                displayPrice = Math.round(
                  cartDetails[index].rate - (coupon.discountPercent / 100) * cartDetails[index].rate
                );
              } else if (displayPrice < 1000 && displayPrice > 500) {
                displayPrice = Math.round(cartDetails[index].rate - (55 / 100) * cartDetails[index].rate);
              } else if (displayPrice < 500) {
                displayPrice = Math.round(cartDetails[index].rate - (50 / 100) * cartDetails[index].rate);
              }
            }
            if (coupon.discountPercent < 50) {
              displayPrice = Math.round(cartDetails[index].rate - (coupon.discountPercent / 100) * cartDetails[index].rate);
            }
            Cart.push({
              code: cartDetails[index].code,
              quantity: cartDetails[index].quantity,
              rate: displayPrice,
            });
            discount += cartDetails[index].rate - displayPrice;
          }
        }
        Cart.forEach((item) => {
          totalCartAmount += item.rate;
        });
        homeCollectionFee = totalCartAmount < 500 ? 200 : 0;
        totalCartAmount += homeCollectionFee;
        if (coupon.discountFlat) {
          discount = Number(coupon.discountFlat);
          totalCartAmount = Number(totalCartAmount - coupon.discountFlat).toFixed(2);
        }
        return {
          Cart,
          homeCollectionFee,
          totalCartAmount,
          moneySaved: discount,
          couponStatus: 'Coupon Applied',
          Actualtotal: totalAmount,
        };
      }
      // coupon expired
      throw new ApiError(httpStatus.BAD_REQUEST, 'Coupon Expired');
      // return { cartDetails, homeCollectionFee, totalCartAmount, moneySaved: 0, couponStatus: 'Coupon Expired' };
    }
    // coupon not found
    throw new ApiError(httpStatus.BAD_REQUEST, 'Coupon Not Found');
    // return { cartDetails, homeCollectionFee, totalCartAmount, moneySaved: 0, couponStatus: 'Coupon Not Found' };
  }
  // No coupons passed
  homeCollectionFee = totalCartAmount < 500 ? 200 : 0;
  totalCartAmount += homeCollectionFee;
  const cartdetails = cartDetails;
  const Actualtotal = totalCartAmount;
  return { cartdetails, homeCollectionFee, totalCartAmount, moneySaved: 0, couponStatus: 'No Coupon', Actualtotal };
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
  const orderId = `MDZGX${short.generate().toUpperCase().slice(8, 25)}`;
  const OTP = generateOTP();

  try {
    const cartdetails = await getCartValue(cart, couponCode);
    const res = await smsService.sendPhoneOtp2F(customerDetails.mobile, OTP, 'Booking Confirmation');
    const guestOrder = await GuestOrder.create({
      customerDetails,
      testDetails,
      paymentDetails,
      sessionId: res.data.Details,
      orderId,
      cart,
      couponCode,
      homeCollectionFee: cartdetails.homeCollectionFee,
      totalCartAmount: cartdetails.totalCartAmount,
      moneySaved: cartdetails.moneySaved,
      couponStatus: cartdetails.couponStatus,
    });
    return { orderId: guestOrder.orderId, sessionId: guestOrder.sessionId };
  } catch (err) {
    return { message: 'There is something wrong with this order.Please check the order detials and try again', err };
  }
};

const prepaidOrder = async (razorpayOrderID, labTestOrderID) => {
  const orderDetails = await GuestOrder.findOne({ orderId: labTestOrderID });
  const paymentDetails = await LabtestOrder.findOne({ razorpayOrderID, labTestOrderID });
  if (paymentDetails) {
    if (orderDetails && paymentDetails.isPaid === true) {
      let finalProductCode = '';
      // generating multiple order string
      for (let i = 0; i < orderDetails.cart.length; i += 1) {
        finalProductCode += orderDetails.cart[i].productCode;
        finalProductCode = i < orderDetails.cart.length - 1 ? `${finalProductCode},` : finalProductCode;
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
        orderDetails.totalCartAmount,
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
        homeCollectionFee: orderDetails.homeCollectionFee,
        totalCartAmount: orderDetails.totalCartAmount,
        moneySaved: orderDetails.moneySaved,
        couponStatus: orderDetails.couponStatus,
      };
      return { isOrderPlaced: true, orderData };
    }
  }
  return { isOrderPlaced: false, orderData: null };
};

const postpaidOrder = async (orderDetails) => {
  let finalProductCode = '';
  // generating multiple order string
  for (let i = 0; i < orderDetails.cart.length; i += 1) {
    finalProductCode += orderDetails.cart[i].productCode;
    finalProductCode = i < orderDetails.cart.length - 1 ? `${finalProductCode},` : finalProductCode;
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
    orderDetails.totalCartAmount,
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
    homeCollectionFee: orderDetails.homeCollectionFee,
    totalCartAmount: orderDetails.totalCartAmount,
    moneySaved: orderDetails.moneySaved,
    couponStatus: orderDetails.couponStatus,
  };
};

const verifyGuestOrder = async (sessionId, otp, orderId) => {
  let verifyOtpRes = '';
  try {
    verifyOtpRes = await smsService.verifyPhoneOtp2F(otp, sessionId);
  } catch (e) {
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP Didn't Matched");
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
// fetches pincode details of valid pincodes
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

const getLabTestOrder = async (labTestOrderID) => {
  const labTestOrder = await LabtestOrder.findOne({ labTestOrderID });
  return labTestOrder;
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
  getLabTestOrder,
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
