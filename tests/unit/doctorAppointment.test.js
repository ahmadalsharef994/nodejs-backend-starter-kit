/* eslint-disable no-unused-vars */
const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const ApiError = require('../../src/utils/ApiError');

setupTestDB();
jest.setTimeout(20000);

let doctorToken;
let authId;
// login test
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
    authId = res.body.AuthData.id;
  });
});
// get apppointment details
describe('GET /v1/doctor/appointment/:62e4246fd4e3ee003a8b0999/appoinment-details', () => {
  test('Expect to get appointment details', async () => {
    const res = await request(app)
      .get('/v1/doctor/appointment/62e4246fd4e3ee003a8b0999/appoinment-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(httpStatus.OK);
  });
});
describe('GET /v1/doctor/appointment/appointments-type?type=ALL&page=1&limit=1&sortBy=StartTime:asc', () => {
  test('Expect to get all appointments', async () => {
    const res = await request(app)
      .get('/v1/doctor/appointment/appointments-type?type=ALL&page=1&limit=1&sortBy=StartTime:asc')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(httpStatus.OK);
  });
});
// FOLLOWUP appointments
describe('GET /v1/doctor/appointment/appointments-type?type=FOLLOWUP&page=1&limit=1&sortBy=StartTime:asc', () => {
  test('Expect to get all followups', async () => {
    const res = await request(app)
      .get('/v1/doctor/appointment/appointments-type?type=FOLLOWUP&page=1&limit=1&sortBy=StartTime:asc')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(httpStatus.OK);
  });
});
// REFERRED appointments
describe('GET /v1/doctor/appointment/appointments-type?type=REFERRED&page=1&limit=5&sortBy=StartTime:asc', () => {
  test('Expect to get all followups', async () => {
    const res = await request(app)
      .get('/v1/doctor/appointment/appointments-type?type=FOLLOWUP&page=1&limit=1&sortBy=StartTime:asc')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(httpStatus.OK);
  });
});
describe('GET /v1/doctor/appointment/appointments-type?type=CANCELLED&page=1&limit=5&sortBy=StartTime:desc', () => {
  test('Expect to get cancelled appointments', async () => {
    const res = await request(app)
      .get('/v1/doctor/appointment/appointments-type?type=CANCELLED&page=1&limit=5&sortBy=StartTime:desc')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(httpStatus.OK);
  });
});