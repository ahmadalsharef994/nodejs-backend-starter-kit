const httpStatus = require('http-status');
const axios = require('axios');
const ApiError = require('../utils/ApiError');
const Product = require('../models/product.model');

// getting Products from ZOHO inventory:
const getProducts = async () => {
  const products = await axios({
    method: 'get',
    url: `https://inventory.zoho.in/api/v1/items?organization_id=${process.env.ORGANIZATION_ID}`,
    headers: { Authorization: `Zoho-oauthtoken ${global.zohoToken}` },
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
  const product = await axios({
    method: 'get',
    url: ` https://inventory.zoho.in/api/v1/items/${id}?organization_id=${process.env.organization_id}`,
    headers: { Authorization: `Zoho-oauthtoken ${global.zohoToken}` },
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

const addProductReview = async (id, reviewBody) => {
  let product;

  product = await Product.findOne({ productId: id });
  if (!product) {
    product = await Product.create({ productId: id, reviews: [reviewBody] });
    return product;
  }
  await product.reviews.push(reviewBody);
  await product.save();
  return product;
};

const getProductProperty = async (id, property) => {
  const product = await axios({
    method: 'get',
    url: ` https://inventory.zoho.in/api/v1/items/${id}?organization_id=${process.env.organization_id}`,
    headers: { Authorization: `Zoho-oauthtoken ${global.zohoToken}` },
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
  return product[property];
};

module.exports = {
  getProducts,
  getProductById,
  addProductReview,
  getProductProperty,
};
