const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
// const Labtestsdump = require('../Microservices/Labtestsdump');
const { thyrocareServices } = require('../Microservices');
const { labTestService } = require('../services');
const { emailService } = require('../Microservices');
const ApiError = require('../utils/ApiError');

const startAutoUpdateCreds = catchAsync(async (req, res) => {
  try {
    const result = await thyrocareServices.autoUpdateThyrocareCreds();
    if (result) {
      return res.status(httpStatus.OK).json({ message: 'Success' });
    }
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, `Thyrocare service: ${err}`);
  }
});

const thyrocareLogin = catchAsync(async (req, res) => {
  try {
    const isUpdated = await thyrocareServices.thyroLogin();
    // update credentials in db
    if (isUpdated) {
      return res.status(httpStatus.OK).json({ message: 'Success', data: isUpdated });
    }
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, `Thyrocare service: ${err}`);
  }
  return res.status(httpStatus.NOT_FOUND).json({ message: 'Error', data: [] });
});

const thyrocareLabTests = catchAsync(async (req, res) => {
  try {
    const tests = await thyrocareServices.getSavedTestProducts();
    if (tests) {
      return res.status(httpStatus.OK).json({ message: 'Success', data: tests });
    }
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, `Thyrocare service: ${err}`);
  }
});

const updateThyrocareLabTests = catchAsync(async (req, res) => {
  try {
    const tests = await thyrocareServices.updateTestProducts();
    if (tests) {
      return res.status(httpStatus.OK).json({ message: 'Success', data: tests });
    }
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, `Thyrocare service: ${err}`);
  }
  return res.status(httpStatus.NOT_FOUND).json({ message: 'Error', data: [] });
});
const updateLabTestPackages = catchAsync(async (req, res) => {
  const result = await thyrocareServices.updateLabtestPackages();
  if (result) {
    res.status(httpStatus.OK).json({ message: 'labtest packages updated ', data: result });
  } else {
    res.status(httpStatus.NOT_FOUND).json({ message: 'Error', data: [] });
  }
});
const checkPincodeAvailability = catchAsync(async (req, res) => {
  const isAvailable = await thyrocareServices.checkPincodeAvailability(req.body.pincode);
  return res.status(httpStatus.OK).json({ message: 'Success', data: isAvailable });
});

const showPincodeDetails = catchAsync(async (req, res) => {
  const pincodeDetails = await labTestService.getPincodeDetails(req.body.pincode);
  if (pincodeDetails) {
    res.status(httpStatus.OK).json({ message: 'Success', data: pincodeDetails });
  } else {
    res.status(httpStatus.NOT_FOUND).json({ message: 'Failed', error: 'No record found' });
  }
});

const showTestDetails = catchAsync(async (req, res) => {
  const testDetails = await labTestService.getLabTestDetails(req.body.testCode);
  if (testDetails) {
    res.status(httpStatus.OK).json({ message: 'Success', data: testDetails });
  } else {
    res.status(httpStatus.NOT_FOUND).json({ message: 'Failed', error: 'No record found' });
  }
});

const getAvailableTimeSlots = catchAsync(async (req, res) => {
  const slots = await thyrocareServices.checkSlotsAvailability(req.body.pincode, req.body.date);
  return res.status(httpStatus.OK).json({ message: 'Success', data: slots });
});

const showOrderSummary = catchAsync(async (req, res) => {
  const summary = await thyrocareServices.orderSummary(req.body.orderId);
  return res.status(httpStatus.OK).json({ message: 'Success', data: summary });
});

const showReport = catchAsync(async (req, res) => {
  const report = await thyrocareServices.getReport(req.body.leadId, req.body.userMobileNo);
  return res.status(httpStatus.OK).json({ message: 'Success', data: report });
});

const postOrderData = catchAsync(async (req, res) => {
  const { customerDetails, testDetails, paymentDetails, cart, couponCode } = await req.body;
  const orderData = await labTestService.initiateGuestBooking(
    customerDetails,
    testDetails,
    paymentDetails,
    cart,
    couponCode
  );
  if (orderData.orderId) {
    res.status(httpStatus.OK).json({ message: 'Success', data: orderData });
  } else {
    res.status(httpStatus.OK).json({ message: 'Failed', data: orderData });
  }
});

const verifyOrder = catchAsync(async (req, res) => {
  const { sessionId, otp, orderId } = await req.body;
  try {
    const { isOrderPlaced, orderData } = await labTestService.verifyGuestOrder(sessionId, otp, orderId);
    if (orderData) {
      if (isOrderPlaced) {
        const details = `OrderId: ${orderData.orderId} ------------------------- Product: ${orderData.product} ------------------------- Date: ${orderData.date} ------------------------- Time: ${orderData.time} ------------------------- Payment Mode: ${orderData.paymentMode} ------------------------- Amount: ${orderData.totalCartAmount}`;
        await emailService.sendLabTestOrderDetails(orderData.customerDetails.email, orderData.customerDetails.name, details);
      }
      return res.status(httpStatus.OK).json({ message: 'Success', isOrderPlaced, orderData });
    }
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, `labTest service: ${err}`);
  }
});

const cartValue = catchAsync(async (req, res) => {
  try {
    const { cartdetails, homeCollectionFee, totalCartAmount, moneySaved, couponStatus, Cart, Actualtotal } =
      await labTestService.getCartValue(req.body.cart, req.body.couponCode);
    let cart = cartdetails;
    if (cartdetails) {
      cart = cartdetails;
    }
    if (Cart) {
      cart = Cart;
    }
    return res
      .status(httpStatus.OK)
      .json({ message: 'Success', couponStatus, cart, homeCollectionFee, Actualtotal, moneySaved, totalCartAmount });
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, `labTest service: ${err}`);
  }
});

const showGuestOrder = catchAsync(async (req, res) => {
  const orderId = await req.params.orderId;
  try {
    const orderDetails = await labTestService.getGuestOrder(orderId);
    return res.status(httpStatus.OK).json({ message: 'Success', orderDetails });
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, `labTest service: ${err}`);
  }
});

const resendGuestOtp = catchAsync(async (req, res) => {
  try {
    const orderData = await labTestService.resetGuestOtp(req.body.orderId);
    if (orderData) {
      return res.status(httpStatus.OK).json({ message: 'Success', data: orderData });
    }
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, `labTest service: ${err}`);
  }
});

const bookPrepaidOrder = catchAsync(async (req, res) => {
  const { razorpayOrderID, labTestOrderID } = await req.body;
  try {
    const { isOrderPlaced, orderData } = await labTestService.prepaidOrder(razorpayOrderID, labTestOrderID);
    if (orderData) {
      if (isOrderPlaced) {
        const details = `OrderId: ${orderData.orderId} ------------------------- Product: ${orderData.product} ------------------------- Date: ${orderData.date} ------------------------- Time: ${orderData.time} ------------------------- Payment Mode: ${orderData.paymentMode} ------------------------- Amount: ${orderData.totalCartAmount}`;
        await emailService.sendLabTestOrderDetails(orderData.customerDetails.email, orderData.customerDetails.name, details);
      }
      return res.status(httpStatus.OK).json({ message: 'Success', isOrderPlaced, orderData });
    }
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, `labTest service: ${err}`);
  }
});

const getLabtestPackages = catchAsync(async (req, res) => {
  const result = await thyrocareServices.getLabtestPackages();
  if (result) {
    res.status(httpStatus.OK).json({ meassage: 'Success', data: result });
  } else {
    res.status(httpStatus.NOT_FOUND).json({ meassage: 'Error', data: result });
  }
});
// not supported by thyrocare
/*
const fixTimeSlot = catchAsync(async (req, res) => {
  const confirmation = await thyrocareServices.checkSlotsAvailability(req.body.pincode, req.body.date, req.body.orderId);
  return res.status(httpStatus.OK).json({ message: 'Success', data: confirmation });
});

const cancelOrder = catchAsync(async (req, res) => {
  const { orderId, visitId, bTechId, status, appointmentSlot } = req.body;
  const result = await thyrocareServices.cancelThyrocareOrder(orderId, visitId, bTechId, status, appointmentSlot);
  return res.status(httpStatus.OK).json({ message: 'Success', data: result });
});

const rescheduleOrder = catchAsync(async (req, res) => {
  const { orderId, status, others, date, slot } = req.body;
  const result = await thyrocareServices.rescheduleThyrocareOrder(orderId, status, others, date, slot);
  return res.status(httpStatus.OK).json({ message: 'Success', data: result });
});
*/

module.exports = {
  startAutoUpdateCreds,
  thyrocareLogin,
  updateThyrocareLabTests,
  thyrocareLabTests,
  postOrderData,
  verifyOrder,
  checkPincodeAvailability,
  showPincodeDetails,
  getAvailableTimeSlots,
  showOrderSummary,
  showReport,
  cartValue,
  bookPrepaidOrder,
  showGuestOrder,
  resendGuestOtp,
  showTestDetails,
  getLabtestPackages,
  updateLabTestPackages,
  // fixTimeSlot,
  // cancelOrder,
  // rescheduleOrder,
};
