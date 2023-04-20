const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const pdf = require('html-pdf');
const cloudinary = require('cloudinary').v2;

require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const htmlString = fs.readFileSync(filePathName).toString();
  const options = { format: 'Letter' };
  const ejsData = ejs.render(htmlString, data);

  await pdf.create(ejsData, options).toStream((err, response) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'doctorPrescription',
          public_id: 'questions',
          resource_type: 'raw',
        },
        function (error, result) {
          if (error) {
            throw error;
          } else {
            return result;
          }
        }
      )
      .end(response);
  });
};

module.exports = {
  generatePrescription,
};
