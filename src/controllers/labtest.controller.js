const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const Labtestsdump = require('../Microservices/Labtestsdump');
const { thyrocareServices } = require('../Microservices');
const ApiError = require('../utils/ApiError');

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

const thyrocareLogin = catchAsync(async (req, res) => {
  const isUpdated = await thyrocareServices.thyroLogin();
  // update credentials in db
  if (isUpdated) {
    return res.status(httpStatus.OK).json({ message: 'Success', data: isUpdated });
  }
  return res.status(httpStatus.NOT_FOUND).json({ message: 'Error', data: [] });
});

const postOrderData = catchAsync(async (req, res) => {
  const orderData = await thyrocareServices.postThyrocareOrder(
    req.body.fullName,
    req.body.age,
    req.body.gender,
    req.body.address,
    req.body.pincode,
    req.body.productCode,
    req.body.mobile,
    req.body.email,
    req.body.additionalInstructions,
    req.body.rateB2C,
    req.body.dateTime,
    req.body.hardCopyReport,
    req.body.paymentType
  );

  if (orderData) {
    return res.status(httpStatus.OK).json({ message: 'Success', data: orderData });
  }
  throw new ApiError(httpStatus, 'posting order failed');
});

const checkPincodeAvailability = catchAsync(async (req, res) => {
  const isAvailable = await thyrocareServices.checkPincodeAvailability(req.body.pincode);
  return res.status(httpStatus.OK).json({ message: 'Success', data: isAvailable });
});

const getAvailableTimeSlots = catchAsync(async (req, res) => {
  const slots = await thyrocareServices.checkSlotsAvailability(req.body.pincode, req.body.date);
  return res.status(httpStatus.OK).json({ message: 'Success', data: slots });
});

const fixTimeSlot = catchAsync(async (req, res) => {
  const confirmation = await thyrocareServices.checkSlotsAvailability(req.body.pincode, req.body.date, req.body.orderId);
  return res.status(httpStatus.OK).json({ message: 'Success', data: confirmation });
});

const showOrderSummary = catchAsync(async (req, res) => {
  const summary = await thyrocareServices.orderSummary(req.body.orderId);
  return res.status(httpStatus.OK).json({ message: 'Success', data: summary });
});

const showReport = catchAsync(async (req, res) => {
  const report = await thyrocareServices.getReport(req.body.leadId, req.body.userMobileNo);
  return res.status(httpStatus.OK).json({ message: 'Success', data: report });
});

// not supported by thyrocare
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

module.exports = {
  fetchAllLabtests,
  thyrocareLogin,
  updateThyrocareLabTests,
  thyrocareLabTests,
  postOrderData,
  checkPincodeAvailability,
  getAvailableTimeSlots,
  fixTimeSlot,
  showOrderSummary,
  showReport,
  cancelOrder,
  rescheduleOrder,
};
