const express = require('express');
const authUser = require('../../middlewares/authUser');
const validate = require('../../middlewares/validate');
const walletValidation = require('../../validations/wallet.validation');
const walletController = require('../../controllers/wallet.controller');

const router = express.Router();

router
  .route('/get-balance-in-wallet')
  .get(authUser(), validate(walletValidation.getBalanceInWallet), walletController.getBalanceInWallet);

router
  .route('/refund-to-wallet')
  .post(authUser(), validate(walletValidation.refundToWallet), walletController.refundToWallet);

router
  .route('/discount-from-wallet')
  .post(authUser(), validate(walletValidation.discountFromWallet), walletController.discountFromWallet);

router.route('/pay-from-wallet').post(authUser(), validate(walletValidation.payFromWallet), walletController.payFromWallet);

router
  .route('/withdraw-from-wallet')
  .post(authUser(), validate(walletValidation.withdrawFromWallet), walletController.withdrawFromWallet);

module.exports = router;
