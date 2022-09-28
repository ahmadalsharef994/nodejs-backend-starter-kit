const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const cartService = require('../services/cart.service');

const addToCart = catchAsync(async (req, res) => {
  let cart;
  if (req.body.productId) {
    cart = await cartService.addToCart(req.SubjectId, req.body.productId, null);
  }
  if (req.body.packageId) {
    cart = await cartService.addToCart(req.SubjectId, null, req.body.packageId);
  }
  res.status(httpStatus.CREATED).json({ message: 'product added to cart successfully', data: cart });
});

const removeFromCart = catchAsync(async (req, res) => {
  const cart = await cartService.removeFromCart(req.SubjectId, req.body.productId, req.body.packageId);
  res.status(httpStatus.OK).json({ message: ' removed from cart successfully', data: cart });
});

const getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCart(req.SubjectId);
  res.status(httpStatus.OK).json({ message: 'cart retrived successfully', data: cart });
});

module.exports = {
  addToCart,
  removeFromCart,
  getCart,
};
