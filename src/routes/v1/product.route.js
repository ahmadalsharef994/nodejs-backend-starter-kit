const express = require('express');
// const auth = require('../../middlewares/auth');
const { authUser } = require('../../middlewares/auth');
const productController = require('../../controllers/product.controller');

const router = express.Router();

router.route('/').get(authUser(), productController.getProducts);

router.route('/:id').get(authUser(), productController.getProductById); // validate(productValidation.getProductById),

// post review to product
router.route('/:id/reviews').post(authUser(), productController.addProductReview);

// get product property
router.route('/:id/:property').get(authUser(), productController.getProductProperty);

module.exports = router;
