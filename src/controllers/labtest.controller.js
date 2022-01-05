const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
// const Labtestsdump = require('../Microservices/Labtestsdump');
const { thyrocareServices } = require('../Microservices');
const { labTestService } = require('../services');

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
  const { customerDetails, testDetails, paymentDetails, cart } = req.body;
  const orderData = await labTestService.initiateGuestBooking(customerDetails, testDetails, paymentDetails, cart);
  if (orderData) {
    return res.status(httpStatus.OK).json({ message: 'Success', data: orderData });
  }
  return res.status(httpStatus.OK).json({ message: 'Failed', data: [] });
});

const verifyOrder = catchAsync(async (req, res) => {
  const { sessionId, otp, orderId } = req.body;
  const { isOrderPlaced, orderData } = await labTestService.verifyGuestOrder(sessionId, otp, orderId);
  if (orderData) {
    return res.status(httpStatus.OK).json({ message: 'Success', isOrderPlaced, orderData });
  }
  return res.status(httpStatus.OK).json({ message: 'Failed', isOrderPlaced, error: 'Order Request Failed' });
});

const cartValue = catchAsync(async (req, res) => {
  const { cartDetails, homeCollectionFee, totalCartAmount } = await labTestService.getCartValue(req.body.cart);
  return res.status(httpStatus.OK).json({ message: 'Success', cartDetails, homeCollectionFee, totalCartAmount });
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
  thyrocareLogin,
  updateThyrocareLabTests,
  thyrocareLabTests,
  postOrderData,
  verifyOrder,
  checkPincodeAvailability,
  getAvailableTimeSlots,
  showOrderSummary,
  showReport,
  cartValue,
  // fixTimeSlot,
  // cancelOrder,
  // rescheduleOrder,
};
