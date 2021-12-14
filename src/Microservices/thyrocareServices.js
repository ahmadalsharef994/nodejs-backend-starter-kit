const axios = require('axios');
const Thyrotoken = require('../models/thyroToken.model');

const thyroLogin = async () => {
  console.log(process.env.THYROCARE_USERNAME);
  console.log(process.env.THYROCARE_PASSWD);
  const res = await axios.post('https://stagingvelso.thyrocare.cloud/api/Login/Login', {
    body: {
      username: '9004844180',
      password: '123456789',
      portalType: '',
      userType: 'DSA',
      Usertypeid: null,
    },
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'PostmanRuntime/7.28.4',
    },
  });
  const doc = await Thyrotoken.findOneAndUpdate(
    { identifier: 'medzgo-thyrocare' },
    { thyroAccessToken: res.data.accessToken, thyroApiKey: res.data.apiKey },
    { upsert: true, new: true }
  );
  console.log(res);
  // console.log([res.data.apiKey, res.data.accessToken]);
  return doc;
};

const checkPincodeAvailability = async (pincode, apiKey, thyroAccessToken) => {
  const res = await axios.post('https://stagingvelso.thyrocare.cloud/api/TechsoApi/PincodeAvailability', {
    headers: { Authorization: `Bearer ${thyroAccessToken}` },
    body: {
      ApiKey: `${apiKey}`,
      Pincode: `${pincode}`,
    },
  });
  // console.log(res);
  // console.log(res.data.Status === 'Y');
  return res.data.Status === 'Y';
};

// date: "2021-12-10"
const checkSlotsAvailability = async (pincode, apiKey, thyroAccessToken, date) => {
  const res = await axios.post('https://stagingvelso.thyrocare.cloud/api/TechsoApi/GetAppointmentSlots', {
    headers: { Authorization: `Bearer ${thyroAccessToken}` },
    body: {
      ApiKey: `${apiKey}`,
      Pincode: `${pincode}`,
      Date: `${date}`,
    },
  });
  // console.log(res);
  // console.log(res.data.lSlotDataRes);
  return res.data.lSlotDataRes;
};

const postThyrocareOrder = async (
  apiKey,
  thyroAccessToken,
  orderId,
  userFullName,
  userAge,
  gender,
  address,
  pincode,
  productCode,
  userMobile,
  userEmail,
  userRemarks = '',
  rateB2C,
  dateTime,
  hardCopyReports,
  paymentType
) => {
  const res = await axios.post('https://stagingvelso.thyrocare.cloud/api/TechsoApi/PincodeAvailability', {
    headers: { Authorization: `Bearer ${thyroAccessToken}` },
    body: {
      ApiKey: `${apiKey}`,
      OrderId: `${orderId}`,
      Gender: `:${gender}`, // ':male'
      Address: `${address}`,
      Pincode: `${pincode}`,
      Product: `${productCode}`,
      Mobile: `${userMobile}`,
      Email: `${userEmail}`,
      ServiceType: 'H',
      OrderBy: 'DSA',
      Remarks: `${userRemarks}`,
      ReportCode: '',
      Rate: `${rateB2C}`,
      HC: 0,
      ApptDate: `${dateTime}`,
      Passon: 0.0,
      Reports: `${hardCopyReports}`,
      RefCode: `${process.env.THYROCARE_USERNAME}`,
      PayType: `${paymentType}`,
      BenCount: '1',
      BenDataXML: `<NewDataSet><Ben_details><Name>${userFullName}</Name><Age>${userAge}</Age><Gender>${gender.charAt[0].toUpperCase()}</Gender></Ben_details></NewDataSet>`,
    },
  });
  // console.log(res);
  // console.log(res.data);
  return res.data;
};

module.exports = {
  thyroLogin,
  checkPincodeAvailability,
  checkSlotsAvailability,
  postThyrocareOrder,
};
