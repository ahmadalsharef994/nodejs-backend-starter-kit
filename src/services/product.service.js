const httpStatus = require('http-status');
const { default: axios } = require('axios');
const ApiError = require('../utils/ApiError');
const Product = require('../models/product.model');

// getting Products from ZOHO inventory:
const getProducts = async () => {
  const accessToken = await axios({
    method: 'post',
    url: `https://accounts.zoho.in/oauth/v2/token?refresh_token=${process.env.REFRESH_TOKEN}&grant_type=refresh_token&client_id=${process.env.client_id}&client_secret=${process.env.client_secret}`,
  })
    .then((response) => {
      return response.data.access_token;
    })
    .catch((err) => {
      return err;
    });
  const products = await axios({
    method: 'get',
    url: `https://inventory.zoho.in/api/v1/items?organization_id=${process.env.ORGANIZATION_ID}`,
    headers: { Authorization: `Zoho-oauthtoken ${accessToken()}` },
  })
    .then((response) => {
      // console.log(response.data);
      return response.data.items;
    })
    .catch((err) => {
      // console.log(err);
      return err;
    });
  if (!products) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Products not found');
  }
  //   console.log(items);
  return products;
};

// get Product By item_id from zoho inventory
const getProductById = async (id) => {
  const accessToken = await axios({
    method: 'post',
    url: `https://accounts.zoho.in/oauth/v2/token?refresh_token=${process.env.refresh_token}&grant_type=refresh_token&client_id=${process.env.client_id}&client_secret=${process.env.client_secret}`,
  })
    .then((response) => {
      return response.data.access_token;
    })
    .catch((err) => {
      return err;
    });
  const product = await axios({
    method: 'get',
    url: ` https://inventory.zoho.in/api/v1/items/${id}?organization_id=${process.env.organization_id}`,
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  })
    .then((response) => {
      // console.log(response.data);
      return response.data.item;
    })
    .catch((err) => {
      return err;
    });
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  return product;
};

// get product by sku
// const getProductBySku = async (sku) => {
//   const product = await Product.findOne({ sku });
//   if (!product) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
//   }
//   return product;
// };

// get product by id old model
// const getProductById = async (id) => {
//   const product = await Product.findById(id);
//   return product;
// };

const addProductReview = async (id, reviewBody) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  await product.reviews.push(reviewBody);
  await product.save();
  return product;
};

// const getProductReviews = async (id) => {
//   const product = await Product.findById(id);

// get product reviews by id
// const getProductReviewsById = async (id) => {
//   const product = await Product.findById(id);
//   if (!product) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
//   }
//   return product.productReviews;
// };

const getProductProperty = async (id, property) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  return product[property];
};

module.exports = {
  getProducts,
  getProductById,
  addProductReview,
  getProductProperty,
};
