const express = require('express');
const validate = require('../../middlewares/validate');
const authuser = require('../../middlewares/authUser');
const UserProfileValidator = require('../../validations/userProfile.validation');
const UserProfileController = require('../../controllers/userprofile.controller');
// const profilePhotoUpload = require('../../Microservices/profilePicture.service');

const router = express.Router();

router.route('/').get(authuser(), UserProfileController.showUserProfile);

router.route('/basic-details').get(authuser(), UserProfileController.fetchBasicDetails);
router
  .route('/basic-details')
  .post(authuser(), validate(UserProfileValidator.submitBasicDetails), UserProfileController.submitBasicDetails);
// router
//   .route('/basic-details')
//   .put(authuser(), validate(UserProfileValidator.updateBasicDetails), UserProfileController.updateBasicDetails);

router.route('/address-details').get(authuser(), UserProfileController.fetchAddressDetails);
router
  .route('/add-address')
  .post(authuser(), validate(UserProfileValidator.addAddress), UserProfileController.addAddressDetails);
// router
//   .route('/update-address')
//   .put(authuser(), validate(UserProfileValidator.updateAddressD), UserProfileController.updateAddressDetails);

// router.route('/all-members').get(authuser(), UserProfileController.getAllMembers);
// router.route('/add-member').post(authuser(), validate(UserProfileValidator.addMember), UserProfileController.addMember);
// router
//   .route('/update-member')
//   .put(authuser(), validate(UserProfileValidator.updateMember), UserProfileController.updateMember);
// router
//   .route('/delete-member/:memberId')
//   .delete(authuser(), validate(UserProfileValidator.deleteMember), UserProfileController.deleteMember);
// router
//   .route('/update-profilepicture')
//   .put(
//     profilePhotoUpload.uploadPhoto.fields([{ name: 'avatar', maxCount: 1 }]),
//     authuser(),
//     UserProfileController.updateprofilepic
//   );
// router.post(
//   '/notifications',
//   authuser(),
//   validate(UserProfileValidator.updateNotificationSettings),
//   UserProfileController.updateNotificationSettings
// );

// router.route('/stats').get(authuser(), UserProfileController.getStats);

router.route('/upcoming-events').get(authuser(), UserProfileController.getUpcomingEvents);

module.exports = router;
