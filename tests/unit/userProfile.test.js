/* eslint-disable jest/no-disabled-tests */
/* eslint-disable no-unused-vars */
const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const ApiError = require('../../src/utils/ApiError');

setupTestDB();
jest.setTimeout(20000);

let userToken;

// login test

describe('POST /v1/auth/user/login', () => {
  test('Expect to login and response with a token', async () => {
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
// user notifications
describe('POST /v1/user/profile/notifications', () => {
  test('returns with message "Notification Options Updated!"', async () => {
    const notificationDetails = {
      appNotifications: true,
      promotionalEmails: true,
      offersAndDiscounts: true,
    };
    const res = await request(app)
      .post('/v1/user/profile/notifications')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${userToken}`)
      .send(notificationDetails);
    expect(res.body).not.toBeNull();
    expect(res.body.notificationsData.message).toEqual('Notification Options Updated!');
  });
});
// fetch user profile
describe('GET /v1/user/profile', () => {
  test('fetches user profile', async () => {
    const res = await request(app).get('/v1/user/profile').set('Accept', '*/*').set('Authorization', `Bearer ${userToken}`);
    expect(res.body.message).toEqual("User's Profile details");
  });
});
// fetch user basic details
describe('GET /v1/user/profile/basic-details', () => {
  test('fetches user profile', async () => {
    const res = await request(app)
      .get('/v1/user/profile/basic-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${userToken}`);
    if (res.status === httpStatus.OK) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Success');
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Your basic details is not added');
    }
  });
});
// submit basic details for user
describe('POST /v1/user/profile/basic-details', () => {
  test('returns with message "Basic details Submitted"', async () => {
    const basicDetails = {
      gender: 'male',
      city: 'delhi',
      dob: '1999-02-20',
      languages: ['English'],
      maritalstatus: 'Single',
      height: '159 cms',
      weight: '72 kgs',
    };
    const res = await request(app)
      .post('/v1/user/profile/basic-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${userToken}`)
      .send(basicDetails);
    expect(res.body).not.toBeNull();
    if (res.status === httpStatus.OK) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Basic details submmitted for User');
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Basic Details already submitted');
    }
  });
});
// update basic details user
describe('PUT /v1/user/profile/basic-details', () => {
  test('returns with message "Basic details updated Successfully"', async () => {
    const basicDetails = {
      gender: 'male',
      city: 'delhi',
      dob: '1999-02-20',
      languages: ['English'],
      maritalstatus: 'Single',
      height: '159 cms',
      weight: '72 kgs',
    };
    const res = await request(app)
      .put('/v1/user/profile/basic-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${userToken}`)
      .send(basicDetails);
    expect(res.body).not.toBeNull();
    if (res.status === httpStatus.OK) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Basic details updated Successfully');
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('You have not added your basic details');
    }
  });
});
// fetch user address details
describe('GET /v1/user/profile/address-details', () => {
  test('fetches user profile', async () => {
    const res = await request(app)
      .get('/v1/user/profile/address-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${userToken}`);
    if (res.status === httpStatus.OK) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Success');
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Address details not added');
    }
  });
});
// add address user
describe('POST /v1/user/profile/add-address', () => {
  test('returns with message "Address details already submitted"', async () => {
    const address = {
      addressFristLine: 'house 1097/4',
      addressSecondLine: 'mohini sec-18',
      state: 'delhi',
      pincode: '110085',
    };
    const res = await request(app)
      .post('/v1/user/profile/add-address')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${userToken}`)
      .send(address);
    expect(res.body).not.toBeNull();
    if (res.status === httpStatus.OK) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Address details added');
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Address details already submitted');
    }
  });
});
// update user address details
describe('PUT /v1/user/profile/update-address', () => {
  test('returns with message "Address details updated Successfully"', async () => {
    const address = {
      addressFristLine: 'house 1197/4',
      addressSecondLine: 'mohini sec-18',
      state: 'delhi',
      pincode: '110085',
    };
    const res = await request(app)
      .put('/v1/user/profile/update-address')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${userToken}`)
      .send(address);
    expect(res.body).not.toBeNull();
    if (res.status === httpStatus.OK) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Address details updated Successfully');
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('You have not added your basic details');
    }
  });
});

// add family member of user
describe('POST /v1/user/profile/add-member', () => {
  test('returns with message "New Family Member added"', async () => {
    const familyMember = {
      relation: 'wife',
      fullname: 'sussie yadav',
      gender: 'male',
      mobile: 9137218159,
      email: 'sussie123@gmail.com',
      dob: '2003-09-12',
    };
    const res = await request(app)
      .post('/v1/user/profile/add-member')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${userToken}`)
      .send(familyMember);
    expect(res.body).not.toBeNull();
    if (res.status === httpStatus.OK) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('New Family Member added');
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('You can only add 4 family Members');
    }
  });
});
// update a family member
describe('PUT /v1/user/profile/update-member', () => {
  test('returns with message "Family Member details updated Successfully"', async () => {
    const familyMember = {
      memberId: '62f38843d2e070295016fb05',
      relation: 'wife',
      fullname: 'sussie yadav',
      gender: 'female',
      mobile: 9137218159,
      email: 'sussie56@gmail.com',
      dob: '2003-09-12',
    };
    const res = await request(app)
      .put('/v1/user/profile/update-member')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${userToken}`)
      .send(familyMember);
    expect(res.body).not.toBeNull();
    if (res.status === httpStatus.OK) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Family Member details updated Successfully');
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('You can only add 4 family Members');
    }
  });
});
// delete a family member
describe.skip('DELETE /v1/user/profile/', () => {
  test('returns with message "Member Deleted Successfully"', async () => {
    const res = await request(app)
      .delete('/v1/user/profile/delete-member/memberId:"62f387fe02315f2464b8ac36"')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${userToken}`)
      .send();
    expect(res.body).not.toBeNull();
    if (res.status === httpStatus.OK) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Family Member details updated Successfully');
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual("Family Member Doesn't Exist. Check memberId");
    }
  });
});

// fetch family menbers of user
describe('GET v1/user/profile/all-members', () => {
  test('fetches user family members', async () => {
    const res = await request(app)
      .get('/v1/user/profile/all-members')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${userToken}`);
    if (res.status === httpStatus.OK) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Success');
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Family Members Not Added');
    }
  });
});
// fetch user stats
describe('GET /v1/user/profile/stats?id=624552f245d64b1370f74471', () => {
  test('fetches user stats', async () => {
    const res = await request(app)
      .get('/v1/user/profile/stats?id=624552f245d64b1370f74471')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.body.message).toEqual('success');
  });
});
