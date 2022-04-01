const Wallet = require('../models/wallet.model');

const createNewWallet = async (auth) => {
  // eslint-disable-next-line no-shadow
  const wallet = new Wallet({
    balance: 0,
    cashback: 0,
    auth,
  });
  const result = await wallet.save();
  return result;
};

const getBalanceInWallet = async (AuthData) => {
  // eslint-disable-next-line no-shadow
  const wallet = await Wallet.findOne({ auth: AuthData.id });
  return { balance: wallet.balance, cashback: wallet.cashback };
};

const refundToWallet = async (AuthData, amount, cashback) => {
  // eslint-disable-next-line no-shadow
  const wallet = await Wallet.findOne({ auth: AuthData.id });
  const newCashback = Number(wallet.cashback) + Number(cashback);
  const newBalance = Number(wallet.balance) + Number(amount);
  const result = await wallet.updateOne({ balance: newBalance, cashback: newCashback });
  return result;
};

const payFromWallet = async (AuthData, payFromCashback, payFromBalance) => {
  // eslint-disable-next-line no-shadow
  const wallet = await Wallet.findOne({ auth: AuthData });
  const result = await wallet.updateOne({
    cashback: wallet.cashback - payFromCashback,
    balance: wallet.balance - payFromBalance,
  });
  return result;
};

const withdrawFromWallet = async (AuthData, amount) => {
  // eslint-disable-next-line no-shadow
  const wallet = await Wallet.findOne({ auth: AuthData });
  const result = await Wallet.findByIdAndUpdate(wallet.walletId, { balance: wallet.balance - amount });
  return result;
};

const logTransaction = async (AuthData, transactionDetails) => {
  // eslint-disable-next-line no-shadow
  const wallet = await Wallet.findOne({ auth: AuthData });
  wallet.transactions.push(transactionDetails);
  const result = await wallet.save();
  return result;
};

module.exports = {
  createNewWallet,
  getBalanceInWallet,
  refundToWallet,
  payFromWallet,
  withdrawFromWallet,
  logTransaction,
};
