const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const authService = require('../services/auth.service');
const walletService = require('../services/wallet.service');
const appointmentService = require('../services/doctorAppointment.service.js');

const getBalanceInWallet = catchAsync(async (req, res) => {
  const authId = req.SubjectId;
  const resultData = await walletService.getBalanceInWallet(authId);
  if (resultData) {
    res.status(httpStatus.OK).json({ message: 'wallet balance', data: resultData });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to getBalance' });
  }
});

const refundToWallet = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);

  const refundCondition = req.body.refundCondition;
  let amount = req.body.amount;
  let cashbackAmount = req.body.cashbackAmount;
  let refundSatisfied = false;

  if (refundCondition === 'Cancelled Appointment') {
    const appointmentId = req.body.appointmentId;
    const appointment = await appointmentService.getAppointmentById(appointmentId);
    if (appointment.Status === 'CANCELLED' && appointment.paymentStatus === 'PAID') {
      refundSatisfied = true;
      amount = appointment.price;
      cashbackAmount = 0;
    }
  }

  // if (refundCondition === 'Cancelled Labtest') {
  //   const labTestOrderId = req.body.labTestOrderId;
  //   const labTestOrder = await labTestService.getLabTestOrder(labTestOrderId);
  //   if (labTestOrder.Status === 'CANCELLED' && labTestOrder.isPaid) {
  //     refundSatisfied = true;
  //     amount = labTestOrder.amount;
  //     cashbackAmount = 0;
  //   }
  // }

  if (refundCondition === 'Cashback') {
    cashbackAmount = req.body.cashbackAmount;
    amount = 0;
    if (cashbackAmount) {
      refundSatisfied = true;
    }
  }

  if (refundCondition === 'Doctor Earning') {
    const appointmentId = req.body.appointmentId;
    const appointment = await appointmentService.getAppointmentById(appointmentId);
    if (appointment.Status !== 'CANCELLED' && appointment.paymentStatus === 'PAID') {
      refundSatisfied = true;
      amount = appointment.price;
      cashbackAmount = 0;
    }
  }

  if (refundSatisfied) {
    const resultData = await walletService.refundToWallet(AuthData, amount, cashbackAmount);
    if (resultData) {
      res.status(httpStatus.OK).json({ message: 'Success: refunded', data: resultData });

      await walletService.logTransaction(AuthData, {
        transactionType: 'REFUND',
        refundCondition,
        amount,
        cashbackAmount,
        appointmentId: req.body.appointmentId || null,
        labTestOrderId: req.body.labTestOrderId || null,
      });
    } else {
      res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to refund' });
    }
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Refund Condition is not satisfied' });
  }
});

const discountFromWallet = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);

  const totalPay = req.body.totalPay;
  let payFromCashback = 0;
  let payFromBalance = 0;
  let payAfterWalletDiscount = totalPay;

  const walletBalance = await walletService.getBalanceInWallet(AuthData);

  // 1. discount from cashback
  if (payAfterWalletDiscount > walletBalance.cashback) {
    payFromCashback = walletBalance.cashback;
    payAfterWalletDiscount -= payFromCashback;
  } else {
    payFromCashback = payAfterWalletDiscount;
    payAfterWalletDiscount = 0;
  }
  // payFromCashback = payAfterWalletDiscount > walletBalance.cashback ? walletBalance.cashback : payAfterWalletDiscount;
  // payAfterWalletDiscount = payAfterWalletDiscount - payFromCashback || 0;

  // 2. discount from balance
  if (payAfterWalletDiscount > walletBalance.balance) {
    payFromBalance = walletBalance.balance;
    payAfterWalletDiscount -= payFromBalance;
  } else {
    payFromBalance = payAfterWalletDiscount;
    payAfterWalletDiscount = 0;
  }

  const remainInCashback = walletBalance.cashback - payFromCashback;
  const remainInBalance = walletBalance.balance - payFromBalance;

  res.status(httpStatus.OK).json({
    message: 'wallet discount applied',
    data: { totalPay, payFromCashback, payFromBalance, payAfterWalletDiscount, remainInCashback, remainInBalance },
  });
});

const payFromWallet = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const walletBalance = await walletService.getBalanceInWallet(AuthData);
  if (walletBalance.balance < req.body.payFromBalance || walletBalance.cashback < req.body.payFromCashback) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Cant pay this amount from wallet' });
  }
  const resultData = await walletService.payFromWallet(AuthData, req.body.payFromCashback, req.body.payFromBalance);
  if (resultData) {
    res.status(httpStatus.OK).json({ message: 'Success: paid from wallet', data: resultData });
    await walletService.logTransaction(AuthData, {
      transactionType: 'PAY',
      payFromCashback: req.body.payFromCashback,
      payFromBalance: req.body.payFromBalance,
    });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to pay from wallet' });
  }
});

const withdrawFromWallet = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);

  await walletService.logTransaction(AuthData, {
    transactionType: 'WITHDRAW',
    account_type: 'Bank Account',
    amount: req.body.amount,
    name: req.body.name,
    email: req.body.email,
    contact: req.body.contact,
    ifsc: req.body.ifsc,
    account_number: req.body.accountNumber,
    currency: 'INR',
  });
  const withdrawRequest = await walletService.postWithdrawRequest(AuthData, {
    amount: req.body.amount,
    name: req.body.name,
    email: req.body.email,
    contact: req.body.contact,
    ifsc: req.body.ifsc,
    account_number: req.body.accountNumber,
  });

  res.status(httpStatus.SERVICE_UNAVAILABLE).json({
    message: `Failed to pay to bank account or withdraw from wallet. Transaction Details are logged for future manual processing of withdrawal`,
    json: withdrawRequest,
  });

  // const result = razorpayPaymentServices.withdrawFromWallet(options);
  // if (result) {
  //   const resultData = await walletService.withdrawFromWallet(AuthData, req.body.amount);
  //   if (resultData) {
  //     res.status(httpStatus.OK).json({ message: 'Success: Paid to account and  withdrawn from wallet', resultData });
  //   } else {
  //     res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed: Paid to  account but not withdrawn from wallet' });
  //   }
  // } else {
  // res.status(httpStatus.SERVICE_UNAVAILABLE).json({
  //   message:
  //     'Failed to pay to bank account or withdraw from wallet. Transaction Details will be logged for future manual processing of withdrawal ',
  // });
  // }
});

const getWithdrawRequests = catchAsync(async (req, res) => {
  const resultData = await walletService.getWithdrawRequests();
  if (resultData) {
    res.status(httpStatus.OK).json({ resultData });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to getWithdrawRequests' });
  }
});

const fulfillWithdrawRequest = catchAsync(async (req, res) => {
  const resultData = await walletService.fulfillWithdrawRequest(req.body.withdrawRequestId);
  if (resultData) {
    res
      .status(httpStatus.OK)
      .json({ message: `withdrawRequest ${req.body.withdrawRequestId} FULLFILLED`, data: resultData });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to fulfillWithdrawRequest' });
  }
});

module.exports = {
  getBalanceInWallet,
  refundToWallet,
  discountFromWallet,
  payFromWallet,
  withdrawFromWallet,
  getWithdrawRequests,
  fulfillWithdrawRequest,
};
