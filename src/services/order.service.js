const httpStatus = require('http-status');
const Order = require('../models/order.model');
const ApiError = require('../utils/ApiError');
const Cart = require('../models/cart.model');
const razorpayService = require('./razorpay.service');

const createOrder = async (userId, orderBody) => {
  const cart = Cart.getCart(userId);
  const order = await Order.create({
    userId,
    cart,
    shippingDetails: orderBody.shippingDetails,
    paymentRef: orderBody.paymentRef,
    cashback: orderBody.cashback,
    paymentMethod: orderBody.paymentMethod,
  });
  return order;
};

const getOrders = async () => {
  const orders = await Order.find();
  if (!orders) {
    return;
  }
  return orders;
};

const getOrdersByUser = async (userId) => {
  const orders = await Order.find({ userId });
  if (!orders) {
    return;
  }
  return orders;
};

const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    return;
  }
  return order;
};

const getOrderByPaymentRef = async (paymentRef) => {
  const order = await Order.findOne({ paymentRef });
  if (!order) {
    return;
  }
  return order;
};

const cancelOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  order.status = 'CANCELLED';
  order.paymentStatus = 'REFUNDED';
  const newOrder = await order.save();
  return newOrder;
};

const shipOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  if (order.paymentStatus !== 'PAID') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment is required for delivery');
  }
  try {
    // TODO
    // const pickrrOrder = await pickrrService.shipOrder(order);
    // order.pickrrOrder = pickrrOrder;
    order.status = 'SHIPPED';
    await order.save();
    return order;
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Error in shipping order (pickrr): ${err}`);
  }
};

const payOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  const razorpayOrder = await razorpayService.payOrder(orderId);
  return razorpayOrder;
};

module.exports = {
  createOrder,
  getOrdersByUser,
  getOrders,
  getOrderById,
  getOrderByPaymentRef,
  cancelOrder,
  shipOrder,
  payOrder,
};
