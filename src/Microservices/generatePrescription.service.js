const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const pdf = require('html-pdf');
const AWS = require('aws-sdk');

require('dotenv').config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWSID,
  secretAccessKey: process.env.AWSKEY,
  region: process.env.AWS_REGION,
});

const data = {
  user: {
    name: 'Rahul Sharma',
    age: '23',
    bmi: '18.5',
    problem: 'cold and cough',
  },
};

const generatePrescription = async () => {
  const filePathName = path.resolve(__dirname, '../views/index.ejs');
  const htmlString = fs.readFileSync(filePathName).toString();
  const options = { format: 'Letter' };
  const ejsData = ejs.render(htmlString, data);

  await pdf.create(ejsData, options).toStream((err, response) => {
    s3.upload(
      {
        Bucket: 'prescripto',
        Key: 'doctorPrescription/questions.pdf',
        ACL: 'public-read-write',
        Body: response,
        ContentType: 'application/pdf',
      },
      function (error, file) {
        if (error) {
          throw error;
        } else {
          return file;
        }
      }
    );
  });
};

module.exports = {
  generatePrescription,
};
