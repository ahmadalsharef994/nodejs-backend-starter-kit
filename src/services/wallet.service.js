const Wallet = require('../models/wallet.model');
const WalletWithdrawRequest = require('../models/withrawRequest.model');

const createNewWallet = async (auth) => {
  const wallet = new Wallet({
    balance: 0,
    cashback: 0,
    auth,
  });
  const result = await wallet.save();
  return result;
};

const getBalanceInWallet = async (AuthData) => {
  const wallet = await Wallet.findOne({ auth: AuthData.id });
  return { balance: wallet.balance, cashback: wallet.cashback }; // equals to return Promise.resolve({xxx}) or promise.reject( new Error)
};

const refundToWallet = async (AuthData, amount, cashback) => {
  const wallet = await Wallet.findOne({ auth: AuthData.id });
  const newCashback = Number(wallet.cashback) + Number(cashback);
  const newBalance = Number(wallet.balance) + Number(amount);
  const result = await wallet.updateOne({ balance: newBalance, cashback: newCashback });
  return result;
};

const payFromWallet = async (AuthData, payFromCashback, payFromBalance) => {
  const wallet = await Wallet.findOne({ auth: AuthData });
  const result = await wallet.updateOne({
    cashback: wallet.cashback - payFromCashback,
    balance: wallet.balance - payFromBalance,
  });
  return result;
};

const withdrawFromWallet = async (AuthData, amount) => {
  const wallet = await Wallet.findOne({ auth: AuthData });
  const result = await Wallet.findByIdAndUpdate(wallet.walletId, { balance: wallet.balance - amount });
  return result;
};

const logTransaction = async (AuthData, transactionDetails) => {
  const wallet = await Wallet.findOne({ auth: AuthData });
  wallet.transactions.push(transactionDetails);
  const result = await wallet.save();
  return result;
};

const getWithdrawRequests = async () => {
  const walletWithdrawRequest = await WalletWithdrawRequest.find();
  return walletWithdrawRequest;
};

const postWithdrawRequest = async (AuthData, transactionDetails) => {
  const walletWithdrawRequest = new WalletWithdrawRequest({ AuthData, transactionDetails, status: 'NOT FULFILLED' });
  const result = await walletWithdrawRequest.save();
  return result;
};

const fulfillWithdrawRequest = async (withdrawRequestId) => {
  const result = await WalletWithdrawRequest.findById(withdrawRequestId);
  return result;
};

module.exports = {
  createNewWallet,
  getBalanceInWallet,
  refundToWallet,
  payFromWallet,
  withdrawFromWallet,
  logTransaction,
  getWithdrawRequests,
  postWithdrawRequest,
  fulfillWithdrawRequest,
};
