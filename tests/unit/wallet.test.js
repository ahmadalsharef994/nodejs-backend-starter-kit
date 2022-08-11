/* eslint-disable no-console */
/* eslint-disable jest/no-disabled-tests */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');

setupTestDB();

jest.setTimeout(20000);

describe('Wallet Routes', () => {
  let userToken;
  // login test
  describe('POST /v1/auth/user/login', () => {
    test('Expect to login as a user (patient) and response with a userToken', async () => {
      const loginCredentials = {
        username: 'sadikshaik@gmail.com',
        password: 'Pass@123',
      };
      const res = await request(app)
        .post('/v1/auth/user/login')
        .set('Accept', '*/*')
        .set('fcmtoken', 'abcdddd')
        .set('devicehash', 'abcd')
        .set('devicetype', 'ios')
        .set('Content-Type', 'application/json')
        .set('Connection', 'keep-alive')
        .send(loginCredentials);
      expect(res.body.AuthData).not.toBeNull();
      expect(res.body.authtoken).not.toBeNull();
      userToken = res.body.authtoken;
      console.log(userToken);
    });
  });

  describe('GET /v1/wallet/get-balance-in-wallet', () => {
    test('Expect to response with balance and cashback', async () => {
      const res = await request(app)
        .get('/v1/wallet/get-balance-in-wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(httpStatus.OK);

      expect(res.body.balance).not.toBeNull();
      expect(res.body.cashback).not.toBeNull();
    });
  });

  describe('POST /v1/wallet/refund-to-wallet Cancelled Appointment', () => {
    test('Expect to refund Cancelled Appointment (Cancelled Appointment)', async () => {
      const reqBody = {
        amount: 100,
        cashbackAmount: 100,
        refundCondition: 'Cancelled Appointment',
        appointmentId: '624563e0d229621b80a5ba80',
      };
      const res = await request(app)
        .post('/v1/wallet/refund-to-wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reqBody)
        .expect(httpStatus.OK);

      console.log(`Cancelled Appointment RESPONSE BODY: ${res.body}`);
    });
  });

  describe('POST /v1/wallet/refund-to-wallet Cashback', () => {
    test('Expect to refund cashback (cashback)', async () => {
      const reqBody = {
        amount: 1000,
        cashbackAmount: 1000,
        refundCondition: 'Cashback',
      };
      const res = await request(app)
        .post('/v1/wallet/refund-to-wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reqBody)
        .expect(httpStatus.OK);

      // eslint-disable-next-line no-console
      console.log(`CASHBACK RESPONSE BODY: ${res.body}`);
    });
  });

  describe('POST /v1/wallet/discount-from-wallet', () => {
    test('Expect to discount from wallet', async () => {
      const reqBody = {
        totalPay: 2000,
      };

      const res = await request(app)
        .post('/v1/wallet/discount-from-wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reqBody)
        .expect(httpStatus.OK);
      // eslint-disable-next-line no-console
      console.log(`DISCOUNT FROM WALLET RESPONSE BODY: ${res}`);
    });
  });

  describe('POST /v1/wallet/pay-from-wallet', () => {
    test('Expect to pay from wallet', async () => {
      const reqBody = {
        payFromBalance: 100,
        payFromCashback: 100,
      };

      const res = await request(app)
        .post('/v1/wallet/pay-from-wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reqBody)
        .expect(httpStatus.OK);
      console.log(`PAY FROM WALLET RESPONSE BODY: ${res}`);
      console.log(res);
    });
  });

  describe('POST /v1/wallet/withdraw-from-wallet', () => {
    test('Expect to withdraw from wallet', async () => {
      const reqBody = {
        name: 'AAAAAAAAAAAAA',
        accountNumber: '3923014245098',
        amount: 1000,
        ifsc: '11243144243',
        contact: '9845904321',
        email: 'adsdas@gmail.com',
      };

      const res = await request(app)
        .post('/v1/wallet/withdraw-from-wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reqBody)
        .expect(httpStatus.SERVICE_UNAVAILABLE);
      console.log(`WITHDRAW FROM WALLET RESPONSE BODY: ${res}`);
      console.log(res);
    });
  });
});

describe('Wallet Withraw Requests Routes', () => {
  let adminToken;
  let res;

  describe('POST /v1/internalteam/restricted/adminsignin', () => {
    test('Admin login and response with an adminToken', async () => {
      const loginCredentials = {
        email: 'sadikshaik139@gmail.com',
        password: 'pass@123',
      };

      await request(app)
        .post('/v1/internalteam/restricted/adminsignin')
        .set('Accept', '*/*')
        .set('fcmtoken', 'abcdddd')
        .set('devicehash', 'abcd')
        .set('devicetype', 'ios')
        .set('Content-Type', 'application/json')
        .set('Connection', 'keep-alive')
        .set('secretadminkey', process.env.SECRETADMINKEY)
        .send(loginCredentials)
        .then((response) => {
          res = response.body;
        });

      expect(res.AuthData).not.toBeNull();
      expect(res.authtoken).not.toBeNull();
      adminToken = res.authtoken;
    });
  });

  describe('GET /v1/wallet/get-withdraw-requests', () => {
    test('responses with all withdraw requests', async () => {
      await request(app)
        .get('/v1/wallet/get-withdraw-requests')
        .set('Authorization', `Bearer ${adminToken}`)
        .set('Accept', '*/*')
        .set('fcmtoken', 'abcdddd')
        .set('devicehash', 'abcd')
        .set('devicetype', 'ios')
        .set('Content-Type', 'application/json')
        .set('Connection', 'keep-alive')
        .expect(httpStatus.OK)
        .then((response) => {
          res = response.body;
        });
      console.log(`GET WITHDRAW REQUESTS ${res}`);
      console.log(res);
    });
  });
});

describe('Wallet Order', () => {
  let userToken;
  let res;
  describe('POST /v1/auth/user/login', () => {
    test('Expect to login and response with a userToken', async () => {
      const loginCredentials = {
        username: '11111111111@gmail.com',
        password: 'Pass@123',
      };

      await request(app)
        .post('/v1/auth/user/login')
        .set('Accept', '*/*')
        .set('fcmtoken', 'abcdddd')
        .set('devicehash', 'abcd')
        .set('devicetype', 'ios')
        .set('Content-Type', 'application/json')
        .set('Connection', 'keep-alive')
        .send(loginCredentials)
        .then((response) => {
          res = response.body;
        });

      expect(res.AuthData).not.toBeNull();
      expect(res.authtoken).not.toBeNull();
      userToken = res.authtoken;
    });
  });

  describe('POST /v1/razorpay/createorder-wallet', () => {
    test('creates a wallet order of 1000', async () => {
      const reqBody = {
        walletId: '62445133514fd632e47527d7',
        amount: 1000,
      };

      await request(app)
        .post('/v1/razorpay/createorder-wallet')
        .set('Authorization', `Bearer ${userToken}`)
        .send(reqBody)
        .expect(httpStatus.OK)
        .then((response) => {
          res = response.body;
        });
      console.log(`CREATE WALLET ORDER RESPONSE BODY: ${res}`);
      console.log(res);
    });
  });
});
