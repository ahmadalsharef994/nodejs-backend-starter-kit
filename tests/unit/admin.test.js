/* eslint-disable jest/no-conditional-expect */
/* eslint-disable jest/no-disabled-tests */
/* eslint-disable no-unused-vars */
const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');

setupTestDB();
jest.setTimeout(20000);

let adminToken;
// admin login

// verify a doctor
describe('POST /v1/internalteam/verifydoctor', () => {
  test('Verify doctor', async () => {
    const data = {
      docid: '62e3955991c8ed5fbcd77a9b',
    };
    const res = await request(app)
      .post('/v1/internalteam/verifydoctor')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(data);
    if (res.body.code === 201) {
      expect(res.body.message).toEqual('Doctor Verified');
    } else {
      expect(res.body.message).toEqual('Doctor Already Verified');
    }
  });
});

// reject a doctor
describe.skip('POST /v1/internalteam/rejectdoctor', () => {
  test('reject doctor', async () => {
    const data = {
      docid: '62e3955991c8ed5fbcd77a9b',
      basicDetails: false,
      educationDetails: false,
      experienceDetails: true,
      payoutdetails: true,
      rejectionMsg: 'Missing Basic Details',
    };
    const res = await request(app)
      .post('/v1/internalteam/rejectdoctor')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(data);
    expect(res.body.message).toEqual('Doctor Verification Rejected Successfully!');
  });
});
// get unverified doctors
describe('GET /v1/internalteam/fetch-unverified-doctors', () => {
  test('Unverified doctor list', async () => {
    const res = await request(app)
      .get('/v1/internalteam/fetch-unverified-doctors')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(httpStatus.OK);
  });
});
// get verified doctors
describe('GET /v1/internalteam/verified-doctors', () => {
  test('Verified doctor list', async () => {
    const res = await request(app)
      .get('/v1/internalteam/verified-doctors')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(httpStatus.OK);
  });
});
// rejected doctors
describe('GET /v1/internalteam/rejected-doctors', () => {
  test('rejected doctor list', async () => {
    const res = await request(app)
      .get('/v1/internalteam/rejected-doctors')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(httpStatus.OK);
  });
});

/**
 * THYROCARE APIS
 *
 */

// intiate auto update THYROCARE CREDENTIALS
describe('GET /v1/labtest/thyrocare/auto-update', () => {
  test('update thyrocare credentials', async () => {
    const res = await request(app)
      .get('/v1/labtest/thyrocare/auto-update')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(httpStatus.OK);
    expect(res.body.message).toEqual('Success');
  });
});
// Thyrocare login
describe('GET /v1/internalteam/restricted/thyrocare-login', () => {
  test('Thyrocare login', async () => {
    const res = await request(app)
      .get('/v1/internalteam/restricted/thyrocare-login')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(httpStatus.OK);
    expect(res.body.message).toEqual('Success');
    expect(res.body.data['API Response'].apikey).not.toBeNull();
  });
});
// update test data set
describe('GET /v1/internalteam/restricted/update-thyrocare-tests', () => {
  test('Update thyrocare tests', async () => {
    const res = await request(app)
      .get('/v1/internalteam/restricted/update-thyrocare-tests')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(httpStatus.OK);
    expect(res.body.message).toEqual('Success');
  });
});
