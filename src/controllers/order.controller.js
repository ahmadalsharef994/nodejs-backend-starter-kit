const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const orderService = require('../services/order.service');

const createOrder = catchAsync(async (req, res) => {
  const userId = req.SubjectId;
  const order = await orderService.createOrder(userId, req.body);
  res.status(httpStatus.CREATED).json({
    status: httpStatus.CREATED,
    data: order,
  });
});

const getOrders = catchAsync(async (req, res) => {
  const orders = await orderService.getOrders();
  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    data: orders,
  });
});

const getOrdersByUser = catchAsync(async (req, res) => {
  const orders = await orderService.getOrdersByUser(req.params.userId);
  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    data: orders,
  });
});

const getOrderById = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    data: order,
  });
});

const getOrderByPaymentRef = catchAsync(async (req, res) => {
  const order = await orderService.getOrderByPaymentRef(req.params.paymentRef);
  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    data: order,
  });
});

const cancelOrder = catchAsync(async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id);
  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    data: order,
  });
});

const shipOrder = catchAsync(async (req, res) => {
  const order = await orderService.shipOrder(req.params.id);
  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    data: order,
  });
});

const payOrder = catchAsync(async (req, res) => {
  // TODO: implement payment
  const order = await orderService.payOrder(req.params.id);
  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    data: order,
  });
});

module.exports = {
  createOrder,
  getOrders,
  getOrdersByUser,
  getOrderById,
  getOrderByPaymentRef,
  cancelOrder,
  shipOrder,
  payOrder,
};
