/* eslint-disable jest/no-disabled-tests */
const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');

setupTestDB();
jest.setTimeout(30000);
describe('GET /v1/labtest/thyrocare/labtests', () => {
  test('Expect to all labtests', async () => {
    const res = await request(app).get('/v1/labtest/thyrocare/labtests').expect(httpStatus.OK);
    expect(res.body.data).not.toBeNull();
  });
});
// check pincode availabiility
describe('POST /v1/labtest/thyrocare/pincode-availability', () => {
  test('Check pincode availability', async () => {
    const data = {
      pincode: 421201,
    };
    const res = await request(app).post('/v1/labtest/thyrocare/pincode-availability').set('Accept', '*/*').send(data);
    expect(res.body.data).not.toBeNull();
    expect(res.body.message).toEqual('Success');
  }, 15000);
});
// get pincode details
describe('POST /v1/labtest/thyrocare/pincode-details', () => {
  test('Check pincode availability', async () => {
    const data = {
      pincode: 421201,
    };
    const res = await request(app)
      .post('/v1/labtest/thyrocare/pincode-details')
      .set('Accept', '*/*')
      .send(data)
      .expect(httpStatus.OK);
    expect(res.body.data).not.toBeNull();
  }, 15000);
});
// get labtest details
describe('POST /v1/labtest/thyrocare/test-details', () => {
  test('Check labest details', async () => {
    const data = {
      testCode: 'FBS',
    };
    const res = await request(app)
      .post('/v1/labtest/thyrocare/test-details')
      .set('Accept', '*/*')
      .send(data)
      .expect(httpStatus.OK);
    expect(res.body.data).not.toBeNull();
    expect(res.body.message).toEqual('Success');
  }, 15000);
});
// check slot availability
describe('POST /v1/labtest/thyrocare/slot-availability', () => {
  test('Check labest details', async () => {
    const data = {
      pincode: 700045,
      date: '2022-09-29',
    };

    const res = await request(app)
      .post('/v1/labtest/thyrocare/slot-availability')
      .set('Accept', '*/*')
      .send(data)
      .expect(httpStatus.OK);
    expect(res.body.data).not.toBeNull();
    expect(res.body.message).toEqual('Success');
  }, 18000);
});

// caluclate the cart value
describe('POST /v1/labtest/thyrocare/cart-values', () => {
  test('Caluclate Cart Value', async () => {
    const data = {
      cart: [
        {
          productCode: 'SIALA',
          quantity: 1,
        },
      ],
    };
    const res = await request(app)
      .post('/v1/labtest/thyrocare/cart-value')
      .set('Accept', '*/*')
      .send(data)
      .expect(httpStatus.OK);
    expect(res.body.data).not.toBeNull();
    expect(res.body.message).toEqual('Success');
  });
});
// make thyrocare guest order
describe('POST /v1/labtest/thyrocare/guest-order', () => {
  test('Make a guest order', async () => {
    const data = {
      customerDetails: {
        name: 'sadik',
        mobile: 8074141263,
        email: 'abc123@gmail.com',
        age: 32,
        gender: 'male',
        address: 'G-473 Alpha II  main market',
        pincode: 201308,
      },
      testDetails: {
        productCode: ['FBS'],
        preferredTestDateTime: '2022-09-24 0:30 PM',
      },
      paymentDetails: {
        paymentType: 'POSTPAID',
      },
      cart: [
        {
          productCode: 'FBS',
          quantity: 1,
        },
      ],
    };
    const res = await request(app)
      .post('/v1/labtest/thyrocare/guest-order')
      .set('Accept', '*/*')
      .set('Content-Type', 'application/json')
      .send(data);
    expect(res.body.data).not.toBeNull();
    expect(res.body.message).toEqual('Success');
  });
}, 18000);
// resend guest otp
describe.skip('POST /v1/labtest/thyrocare/resend-guestotp', () => {
  test('Resend guest order Otp', async () => {
    const data = {
      orderId: 'MDZGXRPZDJ22HKPKXKQ',
    };
    const res = await request(app)
      .post('/v1/labtest/thyrocare/resend-guestotp')
      .set('Accept', '*/*')
      .send(data)
      .expect(httpStatus.OK);
    expect(res.body.data).not.toBeNull();
    expect(res.body.message).toEqual('Success');
  }, 15000);
});
// verify order
describe('POST /v1/labtest/thyrocare/verify-order', () => {
  test('Verify guest order', async () => {
    const data = {
      sessionId: '3381aa62-d9d2-440b-ad9d-268b67b113ea',
      orderId: 'MDZGXEZ7IHJQXLSCN1W',
      otp: 143003,
    };
    const res = await request(app)
      .post('/v1/labtest/thyrocare/verify-order')
      .set('Accept', '*/*')
      .send(data)
      .expect(httpStatus.OK);
    expect(res.body.data).not.toBeNull();
    expect(res.body.message).toEqual('Success');
  });
});
// get guest order
describe('POST /v1/labtest/thyrocare/MDZGXRPZDJ22HKPKXKQ', () => {
  test('Get guest order details', async () => {
    const res = await request(app)
      .post('/v1/labtest/thyrocare/MDZGXRPZDJ22HKPKXKQ')
      .set('Accept', '*/*')
      .expect(httpStatus.OK);
    expect(res.body.data).not.toBeNull();
    expect(res.body.message).toEqual('Success');
  });
}, 10000);
// Get order summary
describe('POST /v1/labtest/thyrocare/order-summary', () => {
  test('Get guest order summary', async () => {
    const data = {
      orderId: 'MDZGX61640173979039',
    };
    const res = await request(app)
      .post('/v1/labtest/thyrocare/order-summary')
      .set('Accept', '*/*')
      .send(data)
      .expect(httpStatus.OK);
    expect(res.body.data).not.toBeNull();
    expect(res.body.message).toEqual('Success');
  });
}, 10000);
