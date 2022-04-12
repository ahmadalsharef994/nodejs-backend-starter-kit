const crypto = require('crypto');
const Razorpay = require('razorpay');
const short = require('short-uuid');
const httpStatus = require('http-status');
// const { compareSync } = require('bcryptjs');
// const axios = require('axios');
const ApiError = require('../utils/ApiError');
const { labtestOrder, GuestOrder, Appointment, appointmentOrder } = require('../models');
const { getCartValue } = require('../services/labTest.service');
const WalletOrder = require('../models/walletOrder.model');
const walletService = require('../services/wallet.service');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// createLabtestOrder
const createLabtestOrder = async (currency, labTestOrderID, sessionID) => {
  const labTestObject = await GuestOrder.findOne({ orderId: labTestOrderID });
  const cartObject = await getCartValue(labTestObject.cart, labTestObject.couponCode);
  const orderAmount = cartObject.totalCartAmount;

  const options = {
    amount: orderAmount * 100,
    currency,
    receipt: short.generate(),
  };

  try {
    const response = await razorpay.orders.create(options);
    response.amount /= 100;

    const razorpayOrderID = response.id;
    await labtestOrder.create({
      // labtestOrder
      razorpayOrderID,
      labTestOrderID,
      amount: orderAmount,
      currency,
      sessionID,
    });

    return response;
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND);
  }
};
// calculateSHADigestLabtest
const calculateSHADigest = async (orderCreationId, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
  const calculatedSHADigest = shasum.digest('hex');

  if (calculatedSHADigest === razorpaySignature) {
    // console.log('request is legit');
    await labtestOrder.findOneAndUpdate({ razorpayOrderID: razorpayOrderId }, { $set: { isPaid: true } }, { new: true });
    return 'match';
  }
  // console.log('calculatedSHADigest: ', digest);
  return 'no_match';
};

const createAppointmentOrder = async (currency, appointmentid, orderId) => {
  const { _id, price } = await Appointment.findOne({ orderId });
  const options = {
    amount: price * 100,
    currency,
    receipt: short.generate(),
  };
  try {
    const response = await razorpay.orders.create(options);
    response.amount /= 100;

    const razorpayOrderID = response.id;
    appointmentOrder.create({
      // appointmentOrder
      razorpayOrderID,
      AppointmentOrderID: orderId,
      amount: price,
      currency,
      appointmentId: _id,
    });
    return response;
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND);
  }
};

const calculateSHADigestAppointment = async (orderCreationId, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
  const calculatedSHADigest = shasum.digest('hex');
  if (calculatedSHADigest === razorpaySignature) {
    // console.log('request is legit');
    await appointmentOrder.findOneAndUpdate({ razorpayOrderID: razorpayOrderId }, { $set: { isPaid: true } });
    await Appointment.findOneAndUpdate({ orderId: orderCreationId }, { $set: { paymentStatus: 'PAID' } });
    return 'match';
  }
  // console.log('calculatedSHADigest: ', digest);
  return 'no_match';
};

const createWalletOrder = async (AuthData, walletId, amount, currency) => {
  const options = {
    amount: amount * 100,
    currency,
    receipt: short.generate(),
  };
  try {
    const response = await razorpay.orders.create(options);
    const razorpayPaymentStatus = response.status;
    response.razorpayPaymentStatus = razorpayPaymentStatus;
    response.amount /= 100;
    const razorpayOrderID = response.id;

    const cashbackAmount = 0;
    await walletService.refundToWallet(AuthData, amount, cashbackAmount);
    await walletService.logTransaction(AuthData, {
      transactionType: 'REFUND',
      refundCondition: 'Add Balance',
      amount,
      cashbackAmount,
      razorpayOrderID,
    });
    const auth = AuthData.id;
    const walletOrder = await WalletOrder.create({
      auth,
      razorpayOrderID,
      walletId,
      amount,
      currency,
      // isPaid: true,
    });
    const walletOrderId = walletOrder.id;
    response.walletOrderId = walletOrderId;
    response.walletOrder = walletOrder;
    return response;
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, 'razorpay failed to create wallet order');
  }
};

// const calculateSHADigestWallet = async (orderCreationId, razorpayOrderID, razorpayPaymentId, razorpaySignature) => {
//   const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
//   shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
//   const calculatedSHADigest = shasum.digest('hex');
//   if (calculatedSHADigest === razorpaySignature) {
//     // console.log('request is legit');
//     await walletOrder.findOneAndUpdate({ razorpayOrderID: razorpayOrderId }, { $set: { isPaid: true } });
//     return 'match';
//   }
//   // console.log('calculatedSHADigest: ', digest);
//   return 'no_match';
// };

const fetchRazorpayOrderStatus = async (razorpayOrderId) => {
  try {
    const response = await razorpay.orders.fetch(razorpayOrderId);
    return response;
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, `fetchRazorpayOrderStatus service: ${err}`);
  }
};

/* const withdrawFromWallet = async (options) => {
  let body = {
    name: options.name,
    email: options.email,
    contact: options.contact,
  };
  const contact = await axios
    .post(`https://api.razorpay.com/v1/contacts`, body, {
      auth: {
        username: process.env.RAZORPAY_KEY_ID,
        password: process.env.RAZORPAY_KEY_SECRET,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch(() => {
      throw new ApiError(400, 'Error Creating Contact');
    });

  body = {
    contact_id: contact.id,
    account_type: 'bank_account',
    bank_account: {
      name: options.name,
      ifsc: options.ifsc,
      account_number: options.account_number,
    },
  };

  const fundAccount = await axios
    .post(`https://api.razorpay.com/v1/fund_accounts`, body, {
      auth: {
        username: process.env.RAZORPAY_KEY_ID,
        password: process.env.RAZORPAY_KEY_SECRET,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch(() => {
      throw new ApiError(400, 'Error Creating Fund Account');
    });

  body = {
    account_number: options.account_number,
    fund_account_id: fundAccount.id,
    amount: options.amount,
    currency: 'INR',
    mode: 'IMPS',
    purpose: 'payout',
  };

  const payout = await axios
    .post(`https://api.razorpay.com/v1/payouts`, body, {
      auth: {
        username: process.env.RAZORPAY_KEY_ID,
        password: process.env.RAZORPAY_KEY_SECRET,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch(() => {
      throw new ApiError(400, 'Error Paying Out');
    });
  return { contact, fundAccount, payout };
}; */

module.exports = {
  calculateSHADigest,
  createLabtestOrder,
  createAppointmentOrder,
  calculateSHADigestAppointment,
  // withdrawFromWallet,
  createWalletOrder,
  fetchRazorpayOrderStatus,
};
