const express = require('express');
const authAdmin = require('../../middlewares/authAdmin');
const validate = require('../../middlewares/validate');
const elasticSearchValidation = require('../../validations/elasticSearch.validation.js');
const elasticSearchController = require('../../controllers/elasticSearch.controller.js');

const router = express.Router();

router
  .route('/create-medicines-index')
  .post(authAdmin(), validate(elasticSearchValidation.createMedicinesIndex), elasticSearchController.createMedicinesIndex);

router
  .route('/create-doctors-index')
  .post(authAdmin(), validate(elasticSearchValidation.createDoctorsIndex), elasticSearchController.createDoctorsIndex);

router
  .route('/delete-index')
  .post(authAdmin(), validate(elasticSearchValidation.deleteIndex), elasticSearchController.deleteIndex);

router
  .route('/create-document')
  .post(authAdmin(), validate(elasticSearchValidation.createDocument), elasticSearchController.createDocument);

router
  .route('/search-document')
  .post(validate(elasticSearchValidation.searchDocument), elasticSearchController.searchDocument);

router
  .route('/index-json-dataset')
  .post(authAdmin(), validate(elasticSearchValidation.indexJsonDataset), elasticSearchController.indexJsonDataset);

router
  .route('/get-client-info')
  .get(authAdmin(), validate(elasticSearchValidation.getClientInfo), elasticSearchController.getClientInfo);

module.exports = router;
