const express = require('express');
const authUser = require('../../middlewares/authUser');
const authUserDoctor = require('../../middlewares/authUserDoctor');
const authAdmin = require('../../middlewares/authAdmin');
const validate = require('../../middlewares/validate');
const walletValidation = require('../../validations/wallet.validation');
const walletController = require('../../controllers/wallet.controller');

const router = express.Router();

router.route('/get-balance-in-wallet-user').get(authUser(), walletController.getBalanceInWallet);

router.route('/get-balance-in-wallet-doctor').get(authUserDoctor(), walletController.getBalanceInWallet);

router
  .route('/refund-to-wallet-user')
  .post(authUser(), validate(walletValidation.refundToWallet), walletController.refundToWalletUser);

router
  .route('/refund-to-wallet-doctor')
  .post(authUserDoctor(), validate(walletValidation.refundToWallet), walletController.refundToWalletDoctor);

router
  .route('/discount-from-wallet')
  .post(authUser(), validate(walletValidation.discountFromWallet), walletController.discountFromWallet);

router.route('/pay-from-wallet').post(authUser(), validate(walletValidation.payFromWallet), walletController.payFromWallet);

router
  .route('/withdraw-from-wallet')
  .post(authUser(), validate(walletValidation.withdrawFromWallet), walletController.withdrawFromWallet);

router
  .route('/get-withdraw-requests')
  .get(authAdmin(), validate(walletValidation.getWithdrawRequests), walletController.getWithdrawRequests);

router
  .route('/fulfill-withdraw-request')
  .post(authAdmin(), validate(walletValidation.fulfillWithdrawRequest), walletController.fulfillWithdrawRequest);

module.exports = router;
