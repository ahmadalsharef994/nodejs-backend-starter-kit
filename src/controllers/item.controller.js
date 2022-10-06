const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const itemService = require('../services/item.service');
const logger = require('../config/logger');

const getItems = catchAsync(async (req, res) => {
  const items = await itemService.getItems();
  res.status(httpStatus.OK).json({ message: 'Items retrieved successfully', data: items });
});

const getItemBySKU = catchAsync(async (req, res) => {
  const item = await itemService.getItemBySKU(req.params.sku);
  res.status(httpStatus.OK).json({ message: 'Item retrieved successfully', data: item });
});

const addItemReview = catchAsync(async (req, res) => {
  const item = await itemService.addItemReview(req.params.sku, req.body);
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
  }
  res.status(httpStatus.CREATED).json({ message: 'Item review added successfully', data: item });
});

const getItemProperty = catchAsync(async (req, res) => {
  const itemProperty = await itemService.getItemProperty(req.params.sku, req.params.property);
  res.status(httpStatus.OK).json({ message: 'Item property retrieved successfully', data: itemProperty });
});

const syncItems = catchAsync(async (req, res) => {
  const zohoItem = JSON.parse(req.body.JSONString.item);
  await itemService.syncItems(zohoItem);
  logger.info(`Item synced successfully:\n${res}`);

  /*
    console.log(JSON.parse(req.body.JSONString));
  req.body.source ==> zoho
  req.body.JSONString  ==> updated/created item
  req.body.JSONString.item.sku ==> item sku
  */
});

module.exports = {
  getItems,
  getItemBySKU,
  addItemReview,
  getItemProperty,
  syncItems,
};
