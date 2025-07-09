import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { paymentService } from '../services/payment.service.js';
import pick from '../utils/pick.js';
import ApiError from '../utils/ApiError.js';

const createOrder = catchAsync(async (req, res) => {
  const orderData = pick(req.body, ['amount', 'currency', 'receipt']);
  orderData.userId = req.user.id;
  const order = await paymentService.createOrder(orderData);
  res.status(httpStatus.CREATED).send(order);
});

const verifyPayment = catchAsync(async (req, res) => {
  const paymentData = pick(req.body, ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature']);
  const result = await paymentService.verifyPayment(paymentData);
  res.send(result);
});

const getOrder = catchAsync(async (req, res) => {
  const order = await paymentService.getOrder(req.params.orderId);
  if (!order) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  res.send(order);
});

const getOrders = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['status', 'userId']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  filter.userId = req.user.id;
  const result = await paymentService.queryOrders(filter, options);
  res.send(result);
});

const createRefund = catchAsync(async (req, res) => {
  const refundData = pick(req.body, ['paymentId', 'amount', 'reason']);
  refundData.userId = req.user.id;
  const refund = await paymentService.createRefund(refundData);
  res.status(httpStatus.CREATED).send(refund);
});

const handleWebhook = catchAsync(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const payload = req.body;
  await paymentService.handleWebhook(payload, signature);
  res.status(httpStatus.OK).send({ status: 'ok' });
});

export {
  createOrder,
  verifyPayment,
  getOrder,
  getOrders,
  createRefund,
  handleWebhook,
};
