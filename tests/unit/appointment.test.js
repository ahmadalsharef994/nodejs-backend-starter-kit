/* eslint-disable jest/no-disabled-tests */
/* eslint-disable no-unused-vars */
const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');

setupTestDB();

// afterAll(async () => {
//   await new Promise((resolve) => setTimeout(() => resolve(), 10000)); // avoid jest open handle error
// });

jest.setTimeout(20000);

let doctorToken;

// *****************************************************************************
// test appointment session

// login test

// test /doctor/appointment/doctor-join
describe.skip('POST /v1/doctor/appointment/doctor-join', () => {
  test('Expect to join doctor to appointment', async () => {
    const res = await request(app)
      .post('/v1/doctor/appointment/doctor-join')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        appointmentId: '62e5f81d228e790ec0115e08',
      })
      .expect(httpStatus.CREATED);
    expect(res.body.videoToken).not.toBeNull();
  });
});

let userToken;
// login test
describe('POST /v1/auth/user/login', () => {
  test('Expect to login as a user (patient) and response with a token', async () => {
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
  });
});

describe('POST /v1/user/appointment/patient-join', () => {
  test('Expect to join user (patient) to appointment', async () => {
    const res = await request(app)
      .post('/v1/user/appointment/patient-join')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        appointmentId: '62e5f81d228e790ec0115e08',
      })
      .expect(httpStatus.CREATED);
    expect(res.body.videoToken).not.toBeNull();
  });
});
