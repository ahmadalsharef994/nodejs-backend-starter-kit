const express = require('express');
const authAdmin = require('../../middlewares/authAdmin');
const validate = require('../../middlewares/validate');
const elasticSearchValidation = require('../../validations/elasticSearch.validation.js');
const elasticSearchController = require('../../controllers/elasticSearch.controller.js');

const router = express.Router();

/**
 * @openapi
 * /admin/elasticsearch/create-medicines-index:
 *  post:
 *     tags:
 *     - admin
 *     - elasticsearch
 */
router
  .route('/create-medicines-index')
  .post(authAdmin(), validate(elasticSearchValidation.createMedicinesIndex), elasticSearchController.createMedicinesIndex);

/**
 * @openapi
 * /admin/elasticsearch/create-doctors-index:
 *  post:
 *     tags:
 *     - admin
 *     - elasticsearch
 */
router
  .route('/create-doctors-index')
  .post(authAdmin(), validate(elasticSearchValidation.createDoctorsIndex), elasticSearchController.createDoctorsIndex);

/**
 * @openapi
 * /admin/elasticsearch/delete-index:
 *  post:
 *     tags:
 *     - admin
 *     - elasticsearch
 */
router
  .route('/delete-index')
  .post(authAdmin(), validate(elasticSearchValidation.deleteIndex), elasticSearchController.deleteIndex);

/**
 * @openapi
 * /admin/elasticsearch/create-document:
 *  post:
 *     tags:
 *     - admin
 *     - elasticsearch
 */
router
  .route('/create-document')
  .post(authAdmin(), validate(elasticSearchValidation.createDocument), elasticSearchController.createDocument);

/**
 * @openapi
 * /admin/elasticsearch/search-document:
 *  post:
 *     tags:
 *     - no authentication
 *     - elasticsearch
 */
router
  .route('/search-document')
  .post(validate(elasticSearchValidation.searchDocument), elasticSearchController.searchDocument);

/**
 * @openapi
 * /admin/elasticsearch/index-json-dataset:
 *  post:
 *     tags:
 *     - admin
 *     - elasticsearch
 */
router
  .route('/index-json-dataset')
  .post(authAdmin(), validate(elasticSearchValidation.indexJsonDataset), elasticSearchController.indexJsonDataset);

/**
 * @openapi
 * /admin/elasticsearch/get-client-info:
 *  get:
 *     tags:
 *     - admin
 *     - elasticsearch
 */
router
  .route('/get-client-info')
  .get(authAdmin(), validate(elasticSearchValidation.getClientInfo), elasticSearchController.getClientInfo);

module.exports = router;
