const axios = require('axios');
const Thyrotoken = require('../models/thyroToken.model');

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

  return doc;
};

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
      OrderId: orderId,
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

  return res.data;
};

module.exports = {
  thyroLogin,
  checkPincodeAvailability,
  checkSlotsAvailability,
  postThyrocareOrder,
};
