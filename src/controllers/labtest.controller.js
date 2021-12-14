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

const thyrocareLogin = catchAsync(async (req, res) => {
  const isUpdated = await thyrocareServices.thyroLogin();
  // update credentials in db
  // console.log(res);
  if (isUpdated) {
    return res.status(httpStatus.OK).json({ message: 'Success', data: isUpdated });
  }
  return res.status(httpStatus.NOT_FOUND).json({ message: 'Error', data: [] });
});

const postOrderData = catchAsync(async (req, res) => {
  const orderData = await thyrocareServices.postOrder(
    req.apiKey,
    req.thyroAccessToken,
    req.orderId,
    req.userFullName,
    req.userAge,
    req.gender,
    req.address,
    req.pincode,
    req.productCode,
    req.userMobile,
    req.userEmail,
    req.userRemarks,
    req.rateB2C,
    req.dateTime,
    req.hardCopyReports,
    req.paymentType
  );

  if (orderData) {
    return res.status(httpStatus.OK).json({ message: 'Success', data: orderData });
  }
  throw new ApiError(httpStatus, 'posting order failed');
});

const checkPincodeAvailability = catchAsync(async (req, res) => {
  const isAvailable = await thyrocareServices.checkPincodeAvailability(req.apiKey, req.pincode);
  return res.status(httpStatus.OK).json({ message: 'Success', data: isAvailable });
});

const getAvailableTimeSlots = catchAsync(async (req, res) => {
  const slots = await thyrocareServices.checkSlotsAvailability(req.apiKey, req.pincode, req.date);
  return res.status(httpStatus.OK).json({ message: 'Success', data: slots });
});

module.exports = {
  fetchAllLabtests,
  thyrocareLogin,
  postOrderData,
  checkPincodeAvailability,
  getAvailableTimeSlots,
};
