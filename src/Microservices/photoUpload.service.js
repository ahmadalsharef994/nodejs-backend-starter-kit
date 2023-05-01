// const dotenv = require('dotenv');
// const multer = require('multer');
// // const path = require('path');
// // const uuid = require('uuid');
// // const Sharp = require('sharp');
// const cloudinary = require('cloudinary').v2;

// dotenv.config();
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
// });

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid file or data, only JPEG ,PNG and JPG is allowed!'), false);
//   }
// };

// const uploadPhoto = multer({
//   storage: multer.diskStorage({}),
//   fileFilter,
//   limits: { fieldNameSize: 100, fileSize: 100000000, fieldSize: 100000000 },
// }).single('photo');

// // const thumbnail = async (filepath) => {
// //   const thumbnailBuffer = await Sharp(filepath).resize(161, 161).toBuffer();
// //   const thumbnailResult = await cloudinary.uploader.upload(thumbnailBuffer, { folder: 'thumbnail' });
// //   return thumbnailResult.secure_url;
// // };

// // const deleteAvatar = async (publicId) => {
// //   const deletionResult = await cloudinary.uploader.destroy(publicId);
// //   return deletionResult.result === 'ok';
// // };

// module.exports = {
//   uploadPhoto,
//   // deleteAvatar,
//   // thumbnail,
// };
