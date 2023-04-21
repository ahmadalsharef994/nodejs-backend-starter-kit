const dotenv = require('dotenv');
// const AWS = require('aws-sdk');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// const multerS3 = require('multer-s3');
// const path = require('path');
// const uuid = require('uuid');

dotenv.config();

// const AwsS3 = new AWS.S3({
//   accessKeyId: process.env.AWSID,
//   region: 'us-east-2',
//   secretAccessKey: process.env.AWSKEY,
//   bucket: process.env.BUCKET,
//   signatureVersion: 'v4',
// });

// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype === 'image/jpeg' ||
//     file.mimetype === 'image/jpg' ||
//     file.mimetype === 'image/png' ||
//     file.mimetype === 'application/pdf'
//   ) {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid file or data, only JPEG ,PNG and pdf is allowed!'), false);
//   }
// };

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'DEV',
  },
});

const upload = multer({ storage });
// const getSignedUrl = async (file) => {
//   const params = {
//     Bucket: process.env.BUCKET,
//     Key: file,
//     Expires: 60 * 5,
//     ResponseContentDisposition: 'inline',
//   };
//   try {
//     const url = await new Promise((resolve, reject) => {
//       AwsS3.getSignedUrl('getObject', params, (err, docs) => {
//         return err ? reject(err) : resolve(docs);
//       });
//     });
//     return url;
//   } catch (err) {
//     if (err) {
//       return err;
//     }
//   }
// };

module.exports = {
  upload,
  // getSignedUrl,
};
