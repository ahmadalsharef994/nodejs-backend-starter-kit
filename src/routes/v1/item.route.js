const express = require('express');
// const auth = require('../../middlewares/auth');
const { authUser } = require('../../middlewares/auth');
const itemController = require('../../controllers/item.controller');

const router = express.Router();

router.route('/').get(authUser(), itemController.getItems);

router.route('/:sku').get(authUser(), itemController.getItemBySKU);

// post review to item
router.route('/:sku/reviews').post(authUser(), itemController.addItemReview);

// get item property
router.route('/:sku/:property').get(authUser(), itemController.getItemProperty);

router.post('/sync', itemController.syncItems);

module.exports = router;
