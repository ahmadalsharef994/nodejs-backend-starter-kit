const express = require('express');
const LabtestController = require('../../controllers/labtest.controller');

const router = express.Router();

router.route('/').get(LabtestController.fetchAllLabtests);
module.exports = router;
