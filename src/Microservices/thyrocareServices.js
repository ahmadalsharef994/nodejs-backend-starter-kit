// const Agenda = require('agenda');
// const axios = require('axios');
// const fs = require('fs');
// const _ = require('underscore');
// const httpStatus = require('http-status');
// const config = require('../config/config');
// const ApiError = require('../utils/ApiError');
// const { ThyrocareToken, ThyrocareOrder } = require('../models');
// const logger = require('../config/logger');

// const dbURL = config.mongoose.url;
// const agenda = new Agenda({
//   db: { address: dbURL, collection: 'thyrocarejobs' },
//   processEvery: '30 seconds',
//   useUnifiedTopology: true,
// });

// const thyroLogin = async () => {
//   const res = await axios.post(
//     `https://${process.env.THYROCARE_API}.thyrocare.cloud/api/Login/Login`,
//     {
//       username: `${process.env.THYROCARE_USERNAME}`,
//       password: `${process.env.THYROCARE_PASSWD}`,
//       portalType: '',
//       userType: 'DSA',
//       Usertypeid: null,
//     },
//     {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     }
//   );

//   const doc = await ThyrocareToken.findOneAndUpdate(
//     { identifier: 'medzgo-thyrocare' },
//     { thyroAccessToken: res.data.accessToken, thyroApiKey: res.data.apiKey },
//     { upsert: true, new: true }
//   );
//   logger.info('Thyrocare API keys updated');
//   return { 'API Response': res.data, Database: doc };
// };

// const updateTestProducts = async () => {
//   const credentials = await ThyrocareToken.findOne({ identifier: 'medzgo-thyrocare' });
//   const res = await axios.post(
//     `https://${process.env.THYROCARE_API}.thyrocare.cloud/api/productsmaster/Products`,
//     {
//       ApiKey: `${credentials.thyroApiKey}`,
//       ProductType: 'TEST',
//     },
//     {
//       headers: { Authorization: `Bearer ${credentials.thyroAccessToken}` },
//     }
//   );

//   try {
//     let thyrocareLabTestData = res.data.master.tests.forEach((element) => {
//       // eslint-disable-next-line no-param-reassign
//       element.rate = element.rate.b2C;
//       // eslint-disable-next-line no-param-reassign
//       element.rate *= process.env.LABTEST_RATE_MULTIPLIER;
//       // eslint-disable-next-line no-param-reassign
//       delete element.margin;
//     });

//     thyrocareLabTestData = JSON.stringify(res.data.master.tests);

//     fs.writeFile('./src/assets/thyrocareTests.json', thyrocareLabTestData, (err) => {
//       if (err) {
//         throw new ApiError(httpStatus.BAD_REQUEST, 'Error writing thyrocareTests file');
//       }
//     });
//   } catch (e) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Update Thyrocare LabTest Data Failed. Update Credentials');
//   }
//   logger.info('Thyrocare Labtest Dataset updated');
//   return res.data.master.tests;
// };
// // For updating labtestPackages
// const updateLabtestPackages = async () => {
//   const credentials = await ThyrocareToken.findOne({ identifier: 'medzgo-thyrocare' });
//   const res = await axios.post(
//     `https://${process.env.THYROCARE_API}.thyrocare.cloud/api/productsmaster/Products`,
//     {
//       ApiKey: `${credentials.thyroApiKey}`,
//       ProductType: 'OFFER',
//     },
//     {
//       headers: { Authorization: `Bearer ${credentials.thyroAccessToken}` },
//     }
//   );
//   try {
//     const labtestpackages = res.data.master.offer.map((element) => {
//       // eslint-disable-next-line no-param-reassign
//       element.packageName = element.name;
//       // eslint-disable-next-line no-param-reassign
//       return element;
//     });
//     const LabTestPackages = JSON.stringify(labtestpackages);
//     fs.writeFileSync('./src/assets/labTestPackages.json', LabTestPackages, (err) => {
//       if (err) {
//         throw new ApiError(httpStatus.BAD_GATEWAY, 'Error writing labtest packages into file');
//       }
//     });
//     return labtestpackages;
//   } catch (error) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Error writing thyrocarePackages file');
//   }
// };
// const getLabtestPackages = async () => {
//   const labtestpackageBuffer = fs.readFileSync('./src/assets/labTestPackages.json');
//   const labpackages = JSON.parse(labtestpackageBuffer);
//   return labpackages;
// };

// // creating jobs for auto update
// agenda.define('updateTestDatasetx1', async (job, done) => {
//   await updateTestProducts();
//   await job.repeatEvery('3 hours', {
//     skipImmediate: true,
//   });
//   await job.priority('high');
//   await job.save();
//   done();
// });
// agenda.define('updateLabtestPackagesx1', async (job, done) => {
//   await updateLabtestPackages();
//   await job.repeatEvery('3 hours', {
//     skipImmediate: true,
//   });
//   await job.priority('high');
//   await job.save();
//   done();
// });

// agenda.define('updateApiKeysx1', async (job, done) => {
//   await thyroLogin();
//   await job.repeatEvery('30 minutes', {
//     skipImmediate: true,
//   });
//   await job.priority('highest');
//   await job.save();
//   done();
// });

// // endpoint for initiating auto update manually
// const autoUpdateThyrocareCreds = async () => {
//   try {
//     await agenda.start();
//     await agenda.every('4 minutes', 'updateTestDataset');
//     await agenda.every('5 minutes', 'updateLabtestPackages');
//     await agenda.every('2 minutes', 'updateApiKeys');
//     logger.info('Agenda Jobs Started');
//     return true;
//   } catch (e) {
//     return false;
//   }
// };

// // initiating auto update
// autoUpdateThyrocareCreds();

// const getSavedTestProducts = async () => {
//   const labtestdataBuffer = fs.readFileSync('src/assets/thyrocareTests.json');
//   const labtestdata = JSON.parse(labtestdataBuffer);
//   // console.log('total tests: ', labtestdata.length);

//   // filtering unique categories
//   let category = _.keys(
//     _.countBy(labtestdata, function (data) {
//       if (data.category) {
//         return data.category.toUpperCase();
//       }
//     })
//   );

//   // filtering for undefined values
//   category = category.filter(function (element) {
//     return element !== 'undefined';
//   });

//   // breaking complex categories
//   let singleCategories = category.map((e) => e.split(' '));

//   // generating the final result for categories
//   singleCategories = singleCategories.flat().sort();

//   // eliminate singular/plural forms for a category
//   for (let i = 0; i < singleCategories.length - 1; i += 1) {
//     if (`${singleCategories[i]}S` === singleCategories[i + 1]) {
//       singleCategories[i + 1] = undefined;
//     }
//   }

//   singleCategories = singleCategories.filter(function (element) {
//     return element !== undefined;
//   });

//   const unique = [...new Set(singleCategories)].sort();

//   return { categories: unique, tests: labtestdata };
// };

// const checkPincodeAvailability = async (pincode) => {
//   const credentials = await ThyrocareToken.findOne({ identifier: 'medzgo-thyrocare' });
//   const res = await axios.post(
//     `https://${process.env.THYROCARE_API}.thyrocare.cloud/api/TechsoApi/PincodeAvailability`,
//     {
//       ApiKey: `${credentials.thyroApiKey}`,
//       Pincode: `${pincode}`,
//     },
//     {
//       headers: { Authorization: `Bearer ${credentials.thyroAccessToken}` },
//     }
//   );

//   return res.data;
// };

// const checkSlotsAvailability = async (pincode, date) => {
//   const credentials = await ThyrocareToken.findOne({ identifier: 'medzgo-thyrocare' });
//   const res = await axios.post(
//     `https://${process.env.THYROCARE_API}.thyrocare.cloud/api/TechsoApi/GetAppointmentSlots`,
//     {
//       ApiKey: `${credentials.thyroApiKey}`,
//       Pincode: `${pincode}`,
//       Date: `${date}`,
//     },
//     {
//       headers: { Authorization: `Bearer ${credentials.thyroAccessToken}` },
//     }
//   );

//   return res.data;
// };

// const postThyrocareOrder = async (
//   sessionId,
//   orderId,
//   fullName,
//   age,
//   gender,
//   address,
//   pincode,
//   productCode,
//   mobile,
//   email,
//   additionalInstructions,
//   rateB2C,
//   dateTime,
//   hardCopyReport,
//   paymentType
// ) => {
//   const credentials = await ThyrocareToken.findOne({ identifier: 'medzgo-thyrocare' });

//   const res = await axios.post(
//     `https://${process.env.THYROCARE_API}.thyrocare.cloud/api/BookingMaster/DSABooking`,
//     {
//       ApiKey: `${credentials.thyroApiKey}`,
//       OrderId: `${orderId}`,
//       Gender: `:${gender.toLowerCase()}`,
//       Address: `${address}`,
//       Pincode: `${pincode}`,
//       Product: `${productCode}`,
//       Mobile: `${mobile}`,
//       Email: `${email}`,
//       ServiceType: 'H',
//       OrderBy: 'DSA',
//       Remarks: `${additionalInstructions}`,
//       ReportCode: '',
//       Rate: parseInt(rateB2C, 10),
//       HC: 0,
//       ApptDate: `${dateTime}`,
//       Passon: 0.0,
//       Reports: `${hardCopyReport}`,
//       RefCode: `${process.env.THYROCARE_USERNAME}`,
//       PayType: `${paymentType}`,
//       BenCount: '1',
//       BenDataXML: `<NewDataSet><Ben_details><Name>${fullName}</Name><Age>${age}</Age><Gender>${gender
//         .charAt(0)
//         .toUpperCase()}</Gender></Ben_details></NewDataSet>`,
//     },
//     {
//       headers: { Authorization: `Bearer ${credentials.thyroAccessToken}` },
//     }
//   );
//   res.data.sessionId = sessionId;

//   try {
//     const orderDetails = await ThyrocareOrder.create(res.data);
//     return orderDetails;
//   } catch (e) {
//     throw new ApiError(httpStatus.BAD_REQUEST, 'Thyrocare Order Save Failed');
//   }
// };
// // fetches labtest order details form orderId
// const orderSummary = async (orderId) => {
//   const credentials = await ThyrocareToken.findOne({ identifier: 'medzgo-thyrocare' });
//   const res = await axios.post(
//     `https://${process.env.THYROCARE_API}.thyrocare.cloud/api/OrderSummary/OrderSummary`,
//     {
//       ApiKey: `${credentials.thyroApiKey}`,
//       OrderNo: `${orderId}`,
//     },
//     {
//       headers: { Authorization: `Bearer ${credentials.thyroAccessToken}` },
//     }
//   );

//   return res.data;
// };

// const getMyReport = async (leadId, userMobileNo) => {
//   const credentials = await ThyrocareToken.findOne({ identifier: 'medzgo-thyrocare' });
//   // [xml|pdf]
//   const res = await axios.get(
//     `https://b2capi.thyrocare.com/order.svc/${credentials.thyroApiKey}/GETREPORTS/${leadId}/xml/${userMobileNo}/Myreport`
//   );
//   return res.data;
// };

// // not supported by thyrocare

// /*
// const fixAppointmentSlot = async (orderId, pincode, date) => {
//   const credentials = await ThyroToken.findOne({ identifier: 'medzgo-thyrocare' });
//   const res = await axios.post(
//     `https://${process.env.THYROCARE_API}.thyrocare.cloud/api/TechsoApi/FixAppointment`,
//     {
//       ApiKey: `${credentials.thyroApiKey}`,
//       VisitId: `${orderId}`,
//       Pincode: `${pincode}`,
//       AppointmentDate: `${date}`,
//     },
//     {
//       headers: { Authorization: `Bearer ${credentials.thyroAccessToken}` },
//     }
//   );

//   return res.data;
// };

// const cancelThyrocareOrder = async (orderId, visitId, bTechId, status, appointmentSlot) => {
//   // const credentials = await Thyrotoken.findOne({ identifier: 'medzgo-thyrocare' });
//   const res = await axios.post('https://b2capi.thyrocare.com/apis/ORDER.svc/cancelledorder', {
//     OrderNo: `${orderId}`,
//     VisitId: `${visitId}`,
//     BTechId: parseInt(bTechId, 10),
//     Status: parseInt(status, 10),
//     AppointmentSlot: parseInt(appointmentSlot, 10),
//   });

//   return res.data;
// };

// const rescheduleThyrocareOrder = async (orderId, status, others, date, slot) => {
//   // const credentials = await Thyrotoken.findOne({ identifier: 'medzgo-thyrocare' });
//   const res = await axios.post('https://b2capi.thyrocare.com/apis/ORDER.svc/UpdateOrderHistory', {
//     OrderNo: `${orderId}`,
//     VisitId: `${orderId}`,
//     Status: parseInt(status, 10),
//     Others: `${others}`,
//     AppointmentDate: `${date}`,
//     AppointmentSlot: parseInt(slot, 10),
//   });

//   return res.data;
// };
// */

// module.exports = {
//   thyroLogin,
//   updateTestProducts,
//   autoUpdateThyrocareCreds,
//   getSavedTestProducts,
//   checkPincodeAvailability,
//   checkSlotsAvailability,
//   postThyrocareOrder,
//   orderSummary,
//   getMyReport,
//   getLabtestPackages,
//   updateLabtestPackages,
//   // fixAppointmentSlot,
//   // rescheduleThyrocareOrder,
//   // cancelThyrocareOrder,
// };
