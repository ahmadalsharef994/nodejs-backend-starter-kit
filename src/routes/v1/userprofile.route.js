const express = require('express');
const validate = require('../../middlewares/validate');
const authuser = require('../../middlewares/authUser');
const UserProfileValidator = require('../../validations/userProfile.validation');
const UserProfileController = require('../../controllers/userprofile.controller');

const router = express.Router();

router.route('/basic-details').get(authuser(), UserProfileController.fetchbasicdetails);
router
  .route('/basic-details')
  .post(authuser(), validate(UserProfileValidator.BasicUserDetails), UserProfileController.submitbasicdetails);
router
  .route('/basic-details')
  .put(authuser(), validate(UserProfileValidator.updateBasicDetails), UserProfileController.updateBasicDetails);

router.route('/get-address-details').get(authuser(), UserProfileController.fetchaddressdetails);
router
  .route('/add-address')
  .post(authuser(), validate(UserProfileValidator.UserAddress), UserProfileController.addAddressdetails);

router.route('/add-member').post(authuser(), validate(UserProfileValidator.AddMember), UserProfileController.addMember);

module.exports = router;
