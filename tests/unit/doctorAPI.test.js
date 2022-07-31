/* eslint-disable no-unused-vars */
const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');

setupTestDB();

// afterAll(async () => {
//   await new Promise((resolve) => setTimeout(() => resolve(), 10000)); // avoid jest open handle error
// });
jest.setTimeout(10000);
// login test
let doctorToken;

describe('POST /v1/auth/doctor/login', () => {
  test('Expect to login and response with a token', async () => {
    const loginCredentials = {
      email: 'sadik.shaik@medzgo.com',
      password: 'Pass@123',
    };
    const res = await request(app)
      .post('/v1/auth/doctor/login')
      .set('Accept', '*/*')
      .set('fcmtoken', 'abcdddd')
      .set('devicehash', 'abcd')
      .set('devicetype', 'ios')
      .set('Content-Type', 'application/json')
      .set('Connection', 'keep-alive')
      .send(loginCredentials);
    expect(res.body.AuthData).not.toBeNull();
    expect(res.body.authtoken).not.toBeNull();
    doctorToken = res.body.authtoken;
  });
});

// logout test (logout doctor)
describe('POST /v1/auth/doctor/logout', () => {
  test('Expect to logout and response with a token', async () => {
    // post request with body has authToken

    const res = await request(app)
      .post('/v1/auth/doctor/logout')
      .send({ authtoken: doctorToken })
      .expect(httpStatus.OK)
      .then((response) => {
        return response.body;
      });
    expect(res.message).toBe('logged out successfully');
  });
});

describe('POST login again', () => {
  test('Expect to login and response with a token', async () => {
    const loginCredentials = {
      email: 'sadik.shaik@medzgo.com',
      password: 'Pass@123',
    };
    const res = await request(app)
      .post('/v1/auth/doctor/login')
      .set('Accept', '*/*')
      .set('fcmtoken', 'abcdddd')
      .set('devicehash', 'abcd')
      .set('devicetype', 'ios')
      .set('Content-Type', 'application/json')
      .set('Connection', 'keep-alive')
      .send(loginCredentials);
    expect(res.body.AuthData).not.toBeNull();
    expect(res.body.authtoken).not.toBeNull();
    doctorToken = res.body.authtoken;
  });
});

// test doctor profile stats
describe('GET /v1/doctor/profile/stats', () => {
  test('Expect to get doctor profile stats', async () => {
    const res = await request(app)
      .get('/v1/doctor/profile/stats')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(httpStatus.OK);
  });
});

// test /v1/doctor/profile
describe('GET /v1/doctor/profile', () => {
  test('Expect to get doctor profile', async () => {
    const res = await request(app)
      .get('/v1/doctor/profile')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(httpStatus.OK);
  });
});

// test /v1/doctor/profile
describe('GET /v1/doctor/profile/basic-details', () => {
  test('Expect to get doctor basic details', async () => {
    const res = await request(app)
      .get('/v1/doctor/profile')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(httpStatus.OK);
  });
});

// test /v1/doctor/profile/education-details
describe('GET /v1/doctor/profile/education-details', () => {
  test('Expect to get doctor education details', async () => {
    const res = await request(app)
      .get('/v1/doctor/profile/education-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(httpStatus.OK);
  });
});

// test /v1/doctor/profile/clinic-details
describe('GET /v1/doctor/profile/clinic-details', () => {
  test('Expect to get doctor clinic details', async () => {
    const res = await request(app)
      .get('/v1/doctor/profile/clinic-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(httpStatus.OK);
  });
});

// test /v1/doctor/profile/experience-details
describe('GET /v1/doctor/profile/experience-details', () => {
  test('Expect to get doctor experience details', async () => {
    const res = await request(app)
      .get('/v1/doctor/profile/experience-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(httpStatus.OK);
  });
});

// test }/v1/doctor/profile/payout-details
describe('GET /v1/doctor/profile/payout-details', () => {
  test('Expect to get doctor payout details', async () => {
    const res = await request(app)
      .get('/v1/doctor/profile/payout-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(httpStatus.OK);
  });
});

// test /v1/doctor/document/view/:doctype  TODO: need to fix

// test /v1/doctor/profile/billing?sortBy=StartDate:desc&limit=20&page=1
describe('GET /v1/doctor/profile/billing', () => {
  test('Expect to get doctor billing', async () => {
    const res = await request(app)
      .get('/v1/doctor/profile/billing')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(httpStatus.OK);
  });
});
