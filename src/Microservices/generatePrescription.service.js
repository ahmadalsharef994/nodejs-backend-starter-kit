// const fs = require('fs');
// const path = require('path');
// const ejs = require('ejs');
// const pdf = require('html-pdf');
// const cloudinary = require('cloudinary').v2;
// const stream = require('stream');

// require('dotenv').config();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const data = {
//   user: {
//     name: 'Rahul Sharma',
//     age: '23',
//     bmi: '18.5',
//     problem: 'cold and cough',
//   },
// };

// const generatePrescription = async () => {
//   const filePathName = path.resolve(__dirname, '../views/index.ejs');
//   const htmlString = fs.readFileSync(filePathName).toString();
//   const options = { format: 'Letter' };
//   const ejsData = ejs.render(htmlString, data);

//   const pdfBuffer = await new Promise((resolve, reject) => {
//     pdf.create(ejsData, options).toBuffer((err, buffer) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(buffer);
//       }
//     });
//   });
//   // save PDF buffer to file
//   fs.writeFileSync('output.pdf', pdfBuffer, (err) => {
//     if (err) {
//       console.error('Failed to save PDF:', err);
//     } else {
//       console.log('PDF saved to file');
//     }
//   });

//   // UPLOAD PDF TO CLOUDINARY
//   const uploadResult = await cloudinary.uploader.upload(
//     'output.pdf',
//     {
//       resource_type: 'raw',
//       folder: 'prescriptions',
//       overwrite: true,
//       format: 'pdf',
//       transformation: [{ width: 500, height: 500, crop: 'limit' }],
//       public_id: 'prescription',
//     },
//     (err, result) => {
//       if (err) {
//         console.error('Failed to upload PDF:', err);
//       } else {
//         console.log('PDF uploaded to cloudinary');
//       }
//     }
//   );

//   return uploadResult.secure_url;
// };

// module.exports = {
//   generatePrescription,
// };
