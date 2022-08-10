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

describe.skip('POST /v1/auth/doctor/login', () => {
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
describe.skip('POST /v1/auth/user/login', () => {
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

describe.skip('POST /v1/user/appointment/patient-join', () => {
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

// *****************************************************************************

// test doctor profile stats
describe.skip('GET /v1/doctor/profile/stats', () => {
  test('Expect to get doctor profile stats', async () => {
    const res = await request(app)
      .get('/v1/doctor/profile/stats')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(httpStatus.OK);
  });
});

// test /v1/doctor/profile
describe.skip('GET /v1/doctor/profile', () => {
  test('Expect to get doctor profile', async () => {
    const res = await request(app)
      .get('/v1/doctor/profile')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(httpStatus.OK);
  });
});

// test /v1/doctor/profile
describe.skip('GET /v1/doctor/profile/basic-details', () => {
  test('Expect to get doctor basic details', async () => {
    const res = await request(app)
      .get('/v1/doctor/profile')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(httpStatus.OK);
  });
});

// test /v1/doctor/profile/education-details
describe.skip('GET /v1/doctor/profile/education-details', () => {
  test('Expect to get doctor education details', async () => {
    const res = await request(app)
      .get('/v1/doctor/profile/education-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(httpStatus.OK);
  });
});

// test /v1/doctor/profile/clinic-details
describe.skip('GET /v1/doctor/profile/clinic-details', () => {
  test('Expect to get doctor clinic details', async () => {
    const res = await request(app)
      .get('/v1/doctor/profile/clinic-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(httpStatus.OK);
  });
});

// test /v1/doctor/profile/experience-details
describe.skip('GET /v1/doctor/profile/experience-details', () => {
  test('Expect to get doctor experience details', async () => {
    const res = await request(app)
      .get('/v1/doctor/profile/experience-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(httpStatus.OK);
  });
});

// *****************************************************************************

// test labTests

// jest /thyrocare/labtests
describe('GET /v1/labtest/thyrocare/labtests', () => {
  test('Expect to get labtests', async () => {
    const res = await request(app).get('/v1/labtest/thyrocare/labtests').set('Accept', '*/*').expect(httpStatus.OK);
    expect(res.body.data).not.toBeNull();
  });
});

describe('GET v1/labtest/thyrocare/labtest-packages', () => {
  test('Expect to get labtest packages', async () => {
    const res = await request(app).get('/v1/labtest/thyrocare/labtest-packages').set('Accept', '*/*').expect(httpStatus.OK);
    expect(res.body.data).not.toBeNull();
  });
});

let adminToken;
// login admin test
describe('POST /v1/internalteam/restricted/adminsignin', () => {
  test('Expect to login as an admin  and response with a token', async () => {
    const loginCredentials = {
      email: 'nitesh123@gmail.com',
      password: 'Nitesh@123',
    };
    const res = await request(app)
      .post('/v1/internalteam/restricted/adminsignin')
      .set('Accept', '*/*')
      .set('fcmtoken', 'abcdddd')
      .set('devicehash', 'abcd')
      .set('devicetype', 'ios')
      .set('Content-Type', 'application/json')
      .set('Connection', 'keep-alive')
      .set('secretadminkey', 'ThisIsSecret')
      .send(loginCredentials);
    expect(res.body.AuthData).not.toBeNull();
    expect(res.body.authtoken).not.toBeNull();
    adminToken = res.body.authtoken;
  });
});

describe('GET v1/labtest/thyrocare/auto-update', () => {
  test('Expect to start autoUpdateThyrocareCreds', async () => {
    const res = await request(app)
      .get('/v1/labtest/thyrocare/auto-update')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(httpStatus.OK);
  });
});
