const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const uuid = require('uuid');

dotenv.config();

const ID = process.env.AWSID;
const SECRET = process.env.AWSKEY;
const PUBLICBUCKET_NAME = process.env.PUBLICBUCKET;

const s3 = new AWS.S3({
  accessKeyId: ID,
  region:'ap-south-1',
  secretAccessKey: SECRET,
  bucket:PUBLICBUCKET_NAME ,
  signatureVersion: 'v4',
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file or data, only JPEG ,PNG and pdf is allowed!'), false);
    }
};

const publicupload = multer({
  storage: multerS3({
    s3,
    acl:'public-read',
    bucket: PUBLICBUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}/${uuid()}${ext}`);
    },
  }),
  fileFilter,
  limits: { fileSize: 100000000 },
});


module.exports = {
   publicupload
};
  