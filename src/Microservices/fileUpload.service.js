/* eslint-disable no-console */
const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const uuid = require('uuid');

dotenv.config();

const ID = process.env.AWSID;
const SECRET = process.env.AWSKEY;
const BUCKET_NAME = process.env.BUCKET;

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
  bucket: BUCKET_NAME,
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file or data, only JPEG ,PNG and pdf is allowed!'), false);
  }
};

const upload = multer({
  storage: multerS3({
    s3,
    bucket: BUCKET_NAME,
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

const getSingedUrl = async (file) => {    
  const params = {
    Bucket: BUCKET_NAME ,
    Key: file ,
    Expires:60 * 5
  };
try {
    const url = await new Promise((resolve, reject) => {
      s3.getSignedUrl('getObject', params, (err, url) => {
        err ? reject(err) : resolve(url);
    });
  });
     return url 
  } catch (err) {
    if (err) {
      return url 
    }
  }
}



module.exports = {
  upload,
  getSingedUrl
};
