const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { elasticSearchService } = require('../Microservices');

const createMedicinesIndex = catchAsync(async (req, res) => {
  const index = req.body.index;
  try {
    const response = await elasticSearchService.createMedicinesIndex(index);
    res.status(httpStatus.OK).json({
      message: `index ${index} created`,
      data: response,
    });
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, `couldn't create index: ${index} due to error ${err}`);
  }
});

const createDoctorsIndex = catchAsync(async (req, res) => {
  const index = req.body.index;
  try {
    const response = await elasticSearchService.createDoctorsIndex(index);
    res.status(httpStatus.OK).json({
      message: `index ${index} created`,
      data: response,
    });
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, `couldn't create index: ${index} due to error ${err}`);
  }
});

const deleteIndex = catchAsync(async (req, res) => {
  const index = req.body.index;
  try {
    const response = await elasticSearchService.deleteIndex(index);
    res.status(httpStatus.OK).json({
      message: `index ${index} deleted`,
      data: response,
    });
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, `couldn't delete index: ${index} due to error: ${err}`);
  }
});

const createDocument = catchAsync(async (req, res) => {
  const { index, document } = req.body;
  try {
    const response = await elasticSearchService.createDocument(index, document);
    res.status(httpStatus.OK).json({
      message: `document ${document} created`,
      data: response,
    });
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, `couldn't create document: ${document} in index ${index} due to error: ${err}`);
  }
});

const searchDocument = catchAsync(async (req, res) => {
  const { index, keyword, value } = req.body;
  try {
    const response = await elasticSearchService.searchDocument(index, keyword, value);
    res.status(httpStatus.OK).json({
      message: `searching for ${keyword}: ${value}`,
      data: response,
    });
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, `couldn't search document in index ${index} \n ${err}`);
  }
});

const indexJsonDataset = catchAsync(async (req, res) => {
  const { index, datasetpath } = req.body;
  try {
    const response = await elasticSearchService.indexJsonDataset(index, datasetpath);
    res.status(httpStatus.OK).json({
      data: response,
    });
  } catch (err) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `couldn't index json dataset file ${datasetpath} in ${index} due to error: ${err}`
    );
  }
});

const getClientInfo = catchAsync(async (req, res) => {
  try {
    const response = await elasticSearchService.getClientInfo();
    res.status(httpStatus.OK).json({
      data: response,
    });
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, `couldn't get ES client info`);
  }
});

module.exports = {
  createDocument,
  searchDocument,
  createMedicinesIndex,
  createDoctorsIndex,
  deleteIndex,
  indexJsonDataset,
  // dataGenerator,
  getClientInfo,
};
