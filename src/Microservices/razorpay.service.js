const crypto = require('crypto');
const Razorpay = require('razorpay');
const short = require('short-uuid');
const httpStatus = require('http-status');
const events = require('events');
const ApiError = require('../utils/ApiError');
const { Appointment, AppointmentOrder, doctordetails } = require('../models');
const doctorAppointmentService = require('../services/doctorAppointment.service');
// const { getCartValue } = require('../services/labTest.service');
const WalletOrder = require('../models/walletOrder.model');
const walletService = require('../services/wallet.service');
const emailService = require('./email.service');
const Order = require('../models/order.model');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const eventEmitter = new events.EventEmitter();

const fetchRazorpayOrderStatus = async (razorpayOrderId) => {
  try {
    const response = await razorpay.orders.fetch(razorpayOrderId);
    return response.status;
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, `fetchRazorpayOrderStatus service: ${err}`);
  }
};

// createLabtestOrder
// const createLabtestOrder = async (currency, labTestOrderID, sessionID) => {
//   const labTestObject = await GuestOrder.findOne({ orderId: labTestOrderID });
//   const cartObject = await getCartValue(labTestObject.cart, labTestObject.couponCode);
//   const orderAmount = cartObject.totalCartAmount;

//   const options = {
//     amount: orderAmount * 100,
//     currency,
//     receipt: short.generate(),
//   };

//   try {
//     const response = await razorpay.orders.create(options);
//     response.amount /= 100;

//     const razorpayOrderID = response.id;
//     // LabtestOrder
//     await LabtestOrder.create({
//       razorpayOrderID,
//       labTestOrderID,
//       amount: orderAmount,
//       currency,
//       sessionID,
//     });

//     return response;
//   } catch (err) {
//     throw new ApiError(httpStatus.NOT_FOUND);
//   }
// };
// calculateSHADigestLabtest
// const calculateSHADigest = async (orderCreationId, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
//   const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
//   shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
//   const calculatedSHADigest = shasum.digest('hex');

//   if (calculatedSHADigest === razorpaySignature) {
//     // console.log('request is legit');
//     await LabtestOrder.findOneAndUpdate({ razorpayOrderID: razorpayOrderId }, { $set: { isPaid: true } }, { new: true });
//     return 'match';
//   }
//   // console.log('calculatedSHADigest: ', digest);
//   return 'no_match';
// };

const createAppointmentOrder = async (currency, appointmentId, orderId) => {
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
    AppointmentOrder.create({
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

const calculateSHADigestAppointment = async (razorpayOrderID, razorpayPaymentId, razorpaySignature) => {
  const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  shasum.update(`${razorpayOrderID}|${razorpayPaymentId}`);
  const calculatedSHADigest = shasum.digest('hex');
  if (calculatedSHADigest === razorpaySignature) {
    // console.log('request is legit');
    await AppointmentOrder.updateOne({ razorpayOrderID }, { $set: { isPaid: true } });
    const paymentDetails = await AppointmentOrder.findOne({ razorpayOrderID });
    if (paymentDetails.isPaid === true) {
      await Appointment.updateOne({ orderId: paymentDetails.AppointmentOrderID }, { $set: { paymentStatus: 'PAID' } });
      const appointmentdetails = await Appointment.findOne({ orderId: paymentDetails.AppointmentOrderID });
      await emailService.appointmentBookingMail(appointmentdetails);
      const Slots = await doctorAppointmentService.getAvailableAppointmentsManually(appointmentdetails.docid);
      await doctordetails.updateOne(
        {
          doctorauthId: appointmentdetails.doctorAuthId,
        },
        { $set: { Slots } }
      );
    }
    return 'match';
  }
  // console.log('calculatedSHADigest: ', digest);
  return 'no_match';
};

const createWalletOrder = async (AuthData, walletId, orderAmount, currency) => {
  const options = {
    amount: orderAmount * 100,
    currency,
    receipt: short.generate(),
  };
  try {
    // 1st: pay
    const response = await razorpay.orders.create(options);
    const razorpayPaymentStatus = response.status;
    response.razorpayPaymentStatus = razorpayPaymentStatus;
    const razorpayOrderID = response.id;

    const auth = AuthData.id;
    // 2nd: create walletOrder
    const walletOrder = await WalletOrder.create({
      auth,
      razorpayOrderID,
      walletId,
      amount: orderAmount,
      currency,
      isPaid: false,
    });
    response.walletOrderId = walletOrder.id;

    // 3rd: listen on payment status. perform and log wallet transaction when paid.
    eventEmitter.on('isPaid', async () => {
      const cashbackAmount = 0;
      await walletService.refundToWallet(AuthData, orderAmount, cashbackAmount);
      await walletService.logTransaction(AuthData, {
        transactionType: 'REFUND',
        refundCondition: 'Add Balance',
        amount: orderAmount,
        cashbackAmount,
        razorpayOrderID,
      });
    });

    // 4th: when payment gets confirmed (check every 5 mins), trigger isPaid event (execute 3rd)
    const timer = setInterval(async () => {
      if ((await fetchRazorpayOrderStatus(razorpayOrderID)) === 'paid') {
        await WalletOrder.findByIdAndUpdate(walletOrder.id, { isPaid: true });
        eventEmitter.emit('isPaid');
        clearInterval(timer);
      }
    }, 5000);

    return response;
  } catch (err) {
    throw new ApiError(httpStatus.NOT_FOUND, 'razorpay failed to create wallet order');
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

const getRazorpayOrder = async (razorpayOrderId) => {
  const razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);
  if (razorpayOrder.error) {
    throw new ApiError(400, `getStatus service: ${razorpayOrder.error.description}`);
  }
  return razorpayOrder;
};

const createRazorpayOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  const razorpayOrder = await razorpay.orders.create({
    amount: order.amount,
    notes: {
      order_id: orderId,
    },
  });
  if (razorpayOrder.error) {
    throw new ApiError(400, `payOrder service: ${razorpayOrder.error.description}`);
  }
  order.paymentRef = razorpayOrder.id;
  await order.save();
  return razorpayOrder;
};

const createRazorpayPayment = async (orderId) => {
  const order = await Order.findById(orderId);
  const razorpayPayment = razorpay.payments.createPaymentJson({
    amount: 100,
    currency: 'INR',
    email: 'gaurav.kumar@example.com',
    contact: '9123456789',
    order_id: 'order_KCXbXeev1x7fnr',
    method: 'netbanking',
    bank: 'HDFC',
  });
  if (razorpayPayment.error) {
    throw new ApiError(400, `createRazorpayPayment service: ${razorpayPayment.error.description}`);
  }
  order.paymentId = razorpayPayment.id;
  order.paymentStatus = 'PAID';
  order.status = 'ORDERED';
  // order.shippingDetails.shippingStatus = 'SHIPPED';
  await order.save();
  return razorpayPayment;
};

// razorpay refund
const refundOrder = async (orderId) => {
  const order = await Order.findById(orderId);

  const razorpayOrder = await razorpay.payments.refund(order.paymentRef, {
    amount: order.amount,
    notes: {
      order_id: orderId,
    },
  });
  if (razorpayOrder.error) {
    throw new ApiError(400, `refundOrder service: ${razorpayOrder.error.description}`);
  }
  order.paymentStatus = 'REFUNDED';
  order.status = 'CANCELLED';
  await order.save();
  return razorpayOrder;
};

module.exports = {
  // calculateSHADigest,
  // createLabtestOrder,
  createAppointmentOrder,
  calculateSHADigestAppointment,
  // withdrawFromWallet,
  createWalletOrder,
  fetchRazorpayOrderStatus,
  getRazorpayOrder,
  createRazorpayOrder,
  createRazorpayPayment,
  refundOrder,
};
