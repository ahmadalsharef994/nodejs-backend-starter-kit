const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const productService = require('../services/product.service');
// const { default: axios } = require('axios');

// const pick = require('../utils/pick');

const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(httpStatus.CREATED).json({ message: 'Product created successfully', data: product });
});

// const getProducts = catchAsync(async (req, res) => {
// const filter = pick(req.query, ['name', 'category', 'isPromoted', 'isActive']);
// filter.price = { $gte: req.query.minPrice || 0, $lte: req.query.maxPrice || Infinity };
// const options = pick(req.query, ['sortBy', 'limit', 'page']);
// const products = await productService.getProducts(filter, options);
// const products = await productService.getProducts(req.params.accesstoken);
// res.status(httpStatus.OK).json({ message: 'Products retrieved successfully', data: products });
// });

const getProducts = catchAsync(async (req, res) => {
  const products = await productService.getProducts();
  res.status(httpStatus.OK).json({ message: 'Products retrieved successfully', data: products });
});

const getProductById = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.status(httpStatus.OK).json({ message: 'Product retrieved successfully', data: product });
});

const addProductReview = catchAsync(async (req, res) => {
  const product = await productService.addProductReview(req.params.id, req.body);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  res.status(httpStatus.CREATED).json({ message: 'Product review added successfully', data: product });
});

const getProductProperty = catchAsync(async (req, res) => {
  const productProperty = await productService.getProductProperty(req.params.id, req.params.property);
  res.status(httpStatus.OK).json({ message: 'Product property retrieved successfully', data: productProperty });
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  addProductReview,
  getProductProperty,
};
