const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const validate = require('../../middlewares/validate');
const authuser = require('../../middlewares/authUser');
const UserProfileValidator = require('../../validations/userProfile.validation');
const UserProfileController = require('../../controllers/userprofile.controller');
// const profilePhotoUpload = require('../../Microservices/photoUpload.service');
const userprofileService = require('../../services/userprofile.service');

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: 2000000 }, // 2MB limit
  fileFilter,
});

// Set up Cloudinary for image uploading
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
router.route('/update-profilepicture').put(authuser(), upload.single('avatar'), async (req, res, next) => {
  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'avatar' });

    // Call the controller method to update the esign field in the database
    const auth = req.SubjectId;
    // const updated = await documentService.updateEsign(result.secure_url, auth);
    const updated = await userprofileService.updateProfilePic(result.secure_url, auth);

    // Check if the update was successful
    if (updated) {
      res.status(200).json({ message: 'Profile pic updated successfully', result: updated });
    } else {
      res.status(500).json({ message: 'Failed to update profile pic' });
    }
  } catch (error) {
    next(error);
  }
});
// router.post(
//   '/notifications',
//   authuser(),
//   validate(UserProfileValidator.updateNotificationSettings),
//   UserProfileController.updateNotificationSettings
// );

// router.route('/stats').get(authuser(), UserProfileController.getStats);

router.route('/upcoming-events').get(authuser(), UserProfileController.getUpcomingEvents);

module.exports = router;
