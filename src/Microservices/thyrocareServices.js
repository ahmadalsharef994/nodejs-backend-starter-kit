const Agenda = require('agenda');
const axios = require('axios');
const fs = require('fs');
const httpStatus = require('http-status');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');
const ThyrocareOrder = require('../models/thyrocareOrder.model');
const Thyrotoken = require('../models/thyroToken.model');

const dbURL = config.mongoose.url;
const agenda = new Agenda({
  db: { address: dbURL, collection: 'thyrocarejobs' },
  processEvery: '30 seconds',
  useUnifiedTopology: true,
});

const thyroLogin = async () => {
  const res = await axios.post(
    'https://velso.thyrocare.cloud/api/Login/Login',
    {
      username: `${process.env.THYROCARE_USERNAME}`,
      password: `${process.env.THYROCARE_PASSWD}`,
      portalType: '',
      userType: 'DSA',
      Usertypeid: null,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const doc = await Thyrotoken.findOneAndUpdate(
    { identifier: 'medzgo-thyrocare' },
    { thyroAccessToken: res.data.accessToken, thyroApiKey: res.data.apiKey },
    { upsert: true, new: true }
  );

  await agenda.start();
  // await agenda.every('24 hours', 'updateThyrocareApiKeys');
  await agenda.schedule('tomorrow at 3am', 'updateThyrocareApiKeys');
  return doc;
};

// creating a job
agenda.define('updateThyrocareApiKeys', async () => {
  await thyroLogin();
});

const getSavedTestProducts = async () => {
  const labtestdataBuffer = fs.readFileSync('src/Microservices/thyrocareTests.json');
  const labtestdata = JSON.parse(labtestdataBuffer);
  // console.log('total tests: ', labtestdata.length);
  return labtestdata;
};

const updateTestProducts = async () => {
  const credentials = await Thyrotoken.findOne({ identifier: 'medzgo-thyrocare' });
  const res = await axios.post(
    'https://velso.thyrocare.cloud/api/productsmaster/Products',
    {
      ApiKey: `${credentials.thyroApiKey}`,
      ProductType: 'TEST',
    },
    {
      headers: { Authorization: `Bearer ${credentials.thyroAccessToken}` },
    }
  );

  const thyrocareLabTestData = JSON.stringify(res.data.master.tests);

  fs.writeFile('./src/Microservices/thyrocareTests.json', thyrocareLabTestData, (err) => {
    if (err) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Error updating thyrocareTests file');
    }
  });

  await agenda.start();
  // await agenda.every('24 hours', 'updateThyrocareApiKeys');
  await agenda.schedule('tomorrow at 3am', 'updateTestData');
  return res.data.master.tests;
};

// creating a job
agenda.define('updateTestData', async () => {
  await updateTestProducts();
});

const checkPincodeAvailability = async (pincode) => {
  const credentials = await Thyrotoken.findOne({ identifier: 'medzgo-thyrocare' });
  const res = await axios.post(
    'https://velso.thyrocare.cloud/api/TechsoApi/PincodeAvailability',
    {
      ApiKey: `${credentials.thyroApiKey}`,
      Pincode: `${pincode}`,
    },
    {
      headers: { Authorization: `Bearer ${credentials.thyroAccessToken}` },
    }
  );

  return res.data;
};

const checkSlotsAvailability = async (pincode, date) => {
  const credentials = await Thyrotoken.findOne({ identifier: 'medzgo-thyrocare' });
  const res = await axios.post(
    'https://velso.thyrocare.cloud/api/TechsoApi/GetAppointmentSlots',
    {
      ApiKey: `${credentials.thyroApiKey}`,
      Pincode: `${pincode}`,
      Date: `${date}`,
    },
    {
      headers: { Authorization: `Bearer ${credentials.thyroAccessToken}` },
    }
  );

  return res.data;
};

const fixAppointmentSlot = async (orderId, pincode, date) => {
  const credentials = await Thyrotoken.findOne({ identifier: 'medzgo-thyrocare' });
  const res = await axios.post(
    'https://velso.thyrocare.cloud/api/TechsoApi/FixAppointment',
    {
      ApiKey: `${credentials.thyroApiKey}`,
      VisitId: `${orderId}`,
      Pincode: `${pincode}`,
      AppointmentDate: `${date}`,
    },
    {
      headers: { Authorization: `Bearer ${credentials.thyroAccessToken}` },
    }
  );

  return res.data;
};

const postThyrocareOrder = async (
  fullName,
  age,
  gender,
  address,
  pincode,
  productCode,
  mobile,
  email,
  additionalInstructions,
  rateB2C,
  dateTime,
  hardCopyReport,
  paymentType
) => {
  const credentials = await Thyrotoken.findOne({ identifier: 'medzgo-thyrocare' });
  const date = Date.now();
  const orderId = `MDZGX${Math.floor(Math.random() * 10)}${date.valueOf()}`;
  const res = await axios.post(
    'https://velso.thyrocare.cloud/api/BookingMaster/DSABooking',
    {
      ApiKey: `${credentials.thyroApiKey}`,
      OrderId: `${orderId}`,
      Gender: `:${gender.toLowerCase()}`,
      Address: `${address}`,
      Pincode: `${pincode}`,
      Product: `${productCode}`,
      Mobile: `${mobile}`,
      Email: `${email}`,
      ServiceType: 'H',
      OrderBy: 'DSA',
      Remarks: `${additionalInstructions}`,
      ReportCode: '',
      Rate: parseInt(rateB2C, 10),
      HC: 0,
      ApptDate: `${dateTime}`,
      Passon: 0.0,
      Reports: `${hardCopyReport}`,
      RefCode: `${process.env.THYROCARE_USERNAME}`,
      PayType: `${paymentType}`,
      BenCount: '1',
      BenDataXML: `<NewDataSet><Ben_details><Name>${fullName}</Name><Age>${age}</Age><Gender>${gender
        .charAt(0)
        .toUpperCase()}</Gender></Ben_details></NewDataSet>`,
    },
    {
      headers: { Authorization: `Bearer ${credentials.thyroAccessToken}` },
    }
  );

  // change model rate type to float
  // add extra field {userId}
  // ref for payment methods {razorpay}
  // status for order confirmation
  // ledger
  const orderDetails = await ThyrocareOrder.create(res.data);
  return orderDetails;
};

const orderSummary = async (orderId) => {
  const credentials = await Thyrotoken.findOne({ identifier: 'medzgo-thyrocare' });
  const res = await axios.post(
    'https://velso.thyrocare.cloud/api/OrderSummary/OrderSummary',
    {
      ApiKey: `${credentials.thyroApiKey}`,
      OrderNo: `${orderId}`,
    },
    {
      headers: { Authorization: `Bearer ${credentials.thyroAccessToken}` },
    }
  );

  return res.data;
};

const getReport = async (leadId, userMobileNo) => {
  const credentials = await Thyrotoken.findOne({ identifier: 'medzgo-thyrocare' });
  // [xml|pdf]
  const res = await axios.get(
    `https://b2capi.thyrocare.com/order.svc/${credentials.thyroApiKey}/GETREPORTS/${leadId}/xml/${userMobileNo}/Myreport`
  );
  return res.data;
};

// not supported by thyrocare
const cancelThyrocareOrder = async (orderId, visitId, bTechId, status, appointmentSlot) => {
  // const credentials = await Thyrotoken.findOne({ identifier: 'medzgo-thyrocare' });
  const res = await axios.post('https://b2capi.thyrocare.com/apis/ORDER.svc/cancelledorder', {
    OrderNo: `${orderId}`,
    VisitId: `${visitId}`,
    BTechId: parseInt(bTechId, 10),
    Status: parseInt(status, 10),
    AppointmentSlot: parseInt(appointmentSlot, 10),
  });

  return res.data;
};

// confirm whether this service is functional
const rescheduleThyrocareOrder = async (orderId, status, others, date, slot) => {
  // const credentials = await Thyrotoken.findOne({ identifier: 'medzgo-thyrocare' });
  const res = await axios.post('https://b2capi.thyrocare.com/apis/ORDER.svc/UpdateOrderHistory', {
    OrderNo: `${orderId}`,
    VisitId: `${orderId}`,
    Status: parseInt(status, 10),
    Others: `${others}`,
    AppointmentDate: `${date}`,
    AppointmentSlot: parseInt(slot, 10),
  });

  return res.data;
};

module.exports = {
  thyroLogin,
  updateTestProducts,
  getSavedTestProducts,
  checkPincodeAvailability,
  checkSlotsAvailability,
  fixAppointmentSlot,
  postThyrocareOrder,
  orderSummary,
  getReport,
  rescheduleThyrocareOrder,
  cancelThyrocareOrder,
};

// a confirmation to user on both email and sms for successful booking on thyrocare
