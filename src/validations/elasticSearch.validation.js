const Joi = require('joi');

const createMedicinesIndex = {
  body: Joi.object().keys({
    index: Joi.string().required(),
  }),
};

const createDoctorsIndex = {
  body: Joi.object().keys({
    index: Joi.string().required(),
  }),
};

const deleteIndex = {
  body: Joi.object().keys({
    index: Joi.string().required(),
  }),
};

const createDocument = {
  body: Joi.object().keys({
    index: Joi.string().required(),
    document: Joi.any(),
  }),
};

const searchDocument = {
  body: Joi.object().keys({
    index: Joi.string().required(),
    keyword: Joi.string().required(),
    value: Joi.string().required(),
  }),
};

const indexJsonDataset = {
  body: Joi.object().keys({
    index: Joi.string().required(),
    datasetpath: Joi.string().required(),
  }),
};

const getClientInfo = {};

module.exports = {
  createMedicinesIndex,
  createDoctorsIndex,
  deleteIndex,
  createDocument,
  searchDocument,
  indexJsonDataset,
  getClientInfo,
};
