/* eslint-disable no-undef */
const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const uuid = require('uuid');
const Sharp = require('sharp');

dotenv.config();
const accessKeyId = process.env.AWSID;
const secretAccessKey = process.env.AWSKEY;
const bucket = process.env.PUBLICBUCKET;

const S3Instance = new AWS.S3({
  accessKeyId,
  region: 'ap-south-1',
  secretAccessKey,
  bucket,
  signatureVersion: 'v4',
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file or data, only JPEG ,PNG and JPG is allowed!'), false);
  }
};

const uploadPhoto = multer({
  storage: multerS3({
    s3: S3Instance,
    acl: 'public-read',
    bucket,
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
  // limits: { fieldNameSize: 100, fileSize: 100000000, fieldSize: 100000000 },
});

const thumbnail = (filepath) => {
  Sharp(filepath)
    .resize(161, 161)
    .toBuffer()
    .then((buffer) => {
      params.Body = buffer;
      params.Key = `thumbnail/${uuid()}${ext}`;
      this.awsS3.upload(params, function (err, data) {
        if (err) {
          return err;
        }
        return data;
      });
    });
};

const deleteAvatar = (key) => {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  S3Instance.deleteObject(params, function (err, data) {
    if (err) {
      // eslint-disable-next-line no-sequences
      return err, err.stack;
    }
    return data;
  });
};

module.exports = {
  uploadPhoto,
  deleteAvatar,
  thumbnail,
};
