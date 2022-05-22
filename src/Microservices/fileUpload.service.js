const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const uuid = require('uuid');

dotenv.config();

const AwsS3 = new AWS.S3({
  accessKeyId: process.env.AWSID,
  region: 'us-east-2',
  secretAccessKey: process.env.AWSKEY,
  bucket: process.env.BUCKET,
  signatureVersion: 'v4',
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file or data, only JPEG ,PNG and pdf is allowed!'), false);
  }
};

const upload = multer({
  storage: multerS3({
    s3: AwsS3,
    bucket: process.env.BUCKET,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}/${uuid()}${ext}`);
    },
  }),
  onError(err, next) {
    next(err);
  },
  fileFilter,
  // 100*1024*1024 ~ 100 mb
  limits: { fileSize: 100000000 },
});

const getSignedUrl = async (file) => {
  const params = {
    Bucket: process.env.BUCKET,
    Key: file,
    Expires: 60 * 5,
    ResponseContentDisposition: 'inline',
  };
  try {
    const url = await new Promise((resolve, reject) => {
      AwsS3.getSignedUrl('getObject', params, (err, docs) => {
        return err ? reject(err) : resolve(docs);
      });
    });
    return url;
  } catch (err) {
    if (err) {
      return err;
    }
  }
};

module.exports = {
  upload,
  getSignedUrl,
};
