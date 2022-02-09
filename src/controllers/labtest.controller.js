const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
// const Labtestsdump = require('../Microservices/Labtestsdump');
const { thyrocareServices } = require('../Microservices');
const { labTestService } = require('../services');
const { emailService } = require('../Microservices');

const startAutoUpdateCreds = catchAsync(async (req, res) => {
  const result = await thyrocareServices.autoUpdateThyrocareCreds();
  if (result) {
    return res.status(httpStatus.OK).json({ message: 'Success' });
  }
  return res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed' });
});

const thyrocareLogin = catchAsync(async (req, res) => {
  const isUpdated = await thyrocareServices.thyroLogin();
  // update credentials in db
  if (isUpdated) {
    return res.status(httpStatus.OK).json({ message: 'Success', data: isUpdated });
  }
  return res.status(httpStatus.NOT_FOUND).json({ message: 'Error', data: [] });
});

const thyrocareLabTests = catchAsync(async (req, res) => {
  const tests = await thyrocareServices.getSavedTestProducts();
  if (tests) {
    return res.status(httpStatus.OK).json({ message: 'Success', data: tests });
  }
  return res.status(httpStatus.NOT_FOUND).json({ message: 'Error', data: [] });
});

const updateThyrocareLabTests = catchAsync(async (req, res) => {
  const tests = await thyrocareServices.updateTestProducts();
  if (tests) {
    return res.status(httpStatus.OK).json({ message: 'Success', data: tests });
  }
  return res.status(httpStatus.NOT_FOUND).json({ message: 'Error', data: [] });
});

const checkPincodeAvailability = catchAsync(async (req, res) => {
  const isAvailable = await thyrocareServices.checkPincodeAvailability(req.body.pincode);
  return res.status(httpStatus.OK).json({ message: 'Success', data: isAvailable });
});

const showPincodeDetails = catchAsync(async (req, res) => {
  const pincodeDetails = await labTestService.getPincodeDetails(req.body.pincode);
  if (pincodeDetails) {
    return res.status(httpStatus.OK).json({ message: 'Success', data: pincodeDetails });
  }
  return res.status(httpStatus.NOT_FOUND).json({ message: 'Failed', error: 'No record found' });
});

const showTestDetails = catchAsync(async (req, res) => {
  const testDetails = await labTestService.getLabTestDetails(req.body.testCode);
  if (testDetails) {
    return res.status(httpStatus.OK).json({ message: 'Success', data: testDetails });
  }
  return res.status(httpStatus.NOT_FOUND).json({ message: 'Failed', error: 'No record found' });
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
  if (orderData) {
    return res.status(httpStatus.OK).json({ message: 'Success', data: orderData });
  }
  return res.status(httpStatus.OK).json({ message: 'Failed', data: [] });
});

const verifyOrder = catchAsync(async (req, res) => {
  const { sessionId, otp, orderId } = await req.body;
  const { isOrderPlaced, orderData } = await labTestService.verifyGuestOrder(sessionId, otp, orderId);
  if (orderData) {
    if (isOrderPlaced) {
      const details = `OrderId: ${orderData.orderId} <---->Product: ${orderData.product} <----->Date: ${orderData.date} <----->Time: ${orderData.time} <----->Payment Mode: ${orderData.paymentMode} <----->Amount: ${orderData.totalCartAmount}`;
      await emailService.sendLabTestOrderDetails(orderData.customerDetails.email, orderData.customerDetails.name, details);
    }
    return res.status(httpStatus.OK).json({ message: 'Success', isOrderPlaced, orderData });
  }
  return res.status(httpStatus.OK).json({ message: 'Failed', isOrderPlaced, error: 'Order Request Failed' });
});

const cartValue = catchAsync(async (req, res) => {
  const { cartDetails, homeCollectionFee, totalCartAmount, moneySaved, couponStatus } = await labTestService.getCartValue(
    req.body.cart,
    req.body.couponCode
  );
  return res
    .status(httpStatus.OK)
    .json({ message: 'Success', couponStatus, cartDetails, homeCollectionFee, moneySaved, totalCartAmount });
});

const showGuestOrder = catchAsync(async (req, res) => {
  const orderId = await req.params.orderId;
  const orderDetails = await labTestService.getGuestOrder(orderId);
  return res.status(httpStatus.OK).json({ message: 'Success', orderDetails });
});

const resendGuestOtp = catchAsync(async (req, res) => {
  const orderData = await labTestService.resetGuestOtp(req.body.orderId);
  if (orderData) {
    return res.status(httpStatus.OK).json({ message: 'Success', data: orderData });
  }
  return res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed', data: [] });
});

const bookPrepaidOrder = catchAsync(async (req, res) => {
  const { razorpayOrderID, labTestOrderID } = await req.body;
  const { isOrderPlaced, orderData } = await labTestService.prepaidOrder(razorpayOrderID, labTestOrderID);
  if (orderData) {
    if (isOrderPlaced) {
      const details = `OrderId: ${orderData.orderId} <---->Product: ${orderData.product} <----->Date: ${orderData.date} <----->Time: ${orderData.time} <----->Payment Mode: ${orderData.paymentMode} <----->Amount: ${orderData.totalCartAmount}`;
      await emailService.sendLabTestOrderDetails(orderData.customerDetails.email, orderData.customerDetails.name, details);
    }
    return res.status(httpStatus.OK).json({ message: 'Success', isOrderPlaced, orderData });
  }
  return res.status(httpStatus.OK).json({ message: 'Failed', isOrderPlaced, error: 'Order Request Failed' });
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

const fetchAllLabtests = catchAsync(async (req, res) => {
  const dataToFind = req.query.id;
  if (dataToFind === undefined) {
    const labdata = await Labtestsdump.Labtestsdump();
    res.status(httpStatus.OK).json(labdata);
  } else {
    const labdatabyid = await Labtestsdump.Labtestsdatabyid(dataToFind);
    if (labdatabyid === undefined) {
      res.status(httpStatus.BAD_REQUEST).json({ message: 'No Lab-Test Found with this ID' });
    }
    res.status(httpStatus.OK).json(labdatabyid);
  }
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
  // fixTimeSlot,
  // cancelOrder,
  // rescheduleOrder,
};
