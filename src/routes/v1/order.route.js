// const express = require('express');
// const { authUser, authAdmin } = require('../../middlewares/auth');
// const orderController = require('../../controllers/order.controller');

// const router = express.Router();

// router.route('/').post(authUser(), orderController.createOrder);

// router.route('/').get(authAdmin(), orderController.getOrders);

// router.route('/:userId').get(authUser(), orderController.getOrdersByUser);

// router.route('/:id').get(authAdmin(), orderController.getOrderById);

// router.route('/:paymentRef').get(authUser(), orderController.getOrderByPaymentRef);

// // route to ship order
// router.route('/:id/ship').patch(authUser(), orderController.shipOrder);

// // route to cancel order
// router.route('/:id/cancel').patch(authUser(), orderController.cancelOrder);

// // route to pay order
// router.route('/:id/pay').patch(authUser(), orderController.payOrder);

// module.exports = router;
