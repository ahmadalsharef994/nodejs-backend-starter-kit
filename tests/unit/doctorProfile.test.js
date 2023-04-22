/* eslint-disable jest/no-disabled-tests */
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

// Submitting doctorBasicDetails
describe('POST /v1/doctor/profile/basic-details', () => {
  test('returns with message "Basic details Submitted"', async () => {
    const basicDetails = {
      gender: 'M',
      dob: '02/02/1999',
      state: 'Goa',
      pincode: '91',
    };
    const res = await request(app)
      .post('/v1/doctor/profile/basic-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(basicDetails);
    expect(res.body).not.toBeNull();
    expect(res.body.message).toEqual('Basic details Submitted');
  });
  test('Tests gender Validation', async () => {
    const basicDetails = {
      gender: 'Male',
      dob: 'jun3',
      state: 'Goa',
      pincode: '91',
    };
    const res = await request(app)
      .post('/v1/doctor/profile/basic-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(basicDetails);
    expect(res.body).not.toBeNull();
    // eslint-disable-next-line prettier/prettier
    expect(res.body.message).toEqual('"gender" must be one of [M, F, O]');
  });
});
// Submitting educational details
describe('POST v1/doctor/profile/education-details', () => {
  test('returns with message "Education Details Submitted!"', async () => {
    const educationDetails = {
      registrationNo: '12356778',
      yearofRegistration: '2000',
      stateMedicalCouncil: 'Arunachal Pradesh Medical Council',
    };
    const res = await request(app)
      .post('/v1/doctor/profile/education-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(educationDetails);
    expect(res.body).not.toBeNull();
    if (res.status === httpStatus.CREATED) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Education Details Submitted!');
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Data Already Submitted');
    }
  });
});
// get doctor clinic details
describe('GET /v1/doctor/profile/clinic-details', () => {
  test('returns clinic details', async () => {
    const res = await request(app)
      .post('/v1/doctor/profile/clinic-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`);
    if (res.status === httpStatus.OK) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body[0].id).not.toBeNull();
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    }
  });
});
// Submitting clinic details
describe('POST /v1/doctor/profile/clinic-details', () => {
  test('returns with message "Clinic details Submitted"', async () => {
    const clinicDetails = {
      clinicName: 'jindal Clinic',
      AddressFirstline: 'Rohini sec-7',
      AddressSecondline: 'delhi 110085',
      clinicTelephone: 9866177,
      pincode: 11,
      timing: [
        {
          MON: [
            {
              startTime: 10,
              endTime: 13,
            },
            {
              startTime: 18,
              endTime: 20,
            },
          ],
        },
      ],
    };
    const res = await request(app)
      .post('/v1/doctor/profile/clinic-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(clinicDetails);
    expect(res.body).not.toBeNull();
    if (res.status === httpStatus.CREATED) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Clinic details Submitted');
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Data Already Submitted');
    }
  });
});
// submitting Experience Details
describe('POST /v1/doctor/profile/experience-details', () => {
  test('returns with message "Experience Details Submitted!"', async () => {
    const experienceDetails = {
      mainstream: 'MBBS',
      specialization: ['Anaesthesiology'],
      skills: ['Skills Comes here'],
      experience: 9,
    };
    const res = await request(app)
      .post('/v1/doctor/profile/experience-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(experienceDetails);
    expect(res.body).not.toBeNull();
    if (res.status === httpStatus.CREATED) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Experience Details Submitted!');
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Data Already Submitted');
    }
  });
});
// fetching experience details
describe('GET /v1/doctor/profile/experience-details', () => {
  test('returns experience details', async () => {
    const res = await request(app)
      .post('/v1/doctor/profile/experience-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`);
    if (res.status === httpStatus.OK) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body[0].auth).toEqual(doctorToken);
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    }
  });
});
// fetching payout details
describe('GET /v1/doctor/profile/payout-details', () => {
  test('returns payout details', async () => {
    const res = await request(app)
      .post('/v1/doctor/profile/payout-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`);
    if (res.status === httpStatus.OK) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.PayoutDetails).toEqual(doctorToken);
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.status).toEqual(httpStatus.BAD_REQUEST);
    }
  });
});

// submitting payout details
describe('POST /v1/doctor/profile/payout-details', () => {
  test('returns with message "Payouts Details Submitted!"', async () => {
    const payoutDetails = {
      BankAccNo: '91832838737',
      IFSC: '82738',
      AccountName: 'Mitesh',
      AadharCardNo: '12356778',
      PanCardNo: '2000',
    };
    const res = await request(app)
      .post('/v1/doctor/profile/payout-details')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(payoutDetails);
    expect(res.body).not.toBeNull();
    if (res.status === httpStatus.CREATED) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Payouts Details Submitted!');
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Data Already Submitted');
    }
  });
});
// doctor notifications
describe('POST /v1/doctor/profile/notifications', () => {
  test('returns with message "Notification Options Updated!"', async () => {
    const notificationDetails = {
      appNotifications: true,
      promotionalEmails: true,
      offersAndDiscounts: false,
    };
    const res = await request(app)
      .post('/v1/doctor/profile/notifications')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(notificationDetails);
    expect(res.body).not.toBeNull();
    expect(res.body.notificationsData.message).toEqual('Notification Options Updated!');
  });
});
// update doctor preference
describe('PUT /v1/doctor/profile/updatePref', () => {
  test('returns with message "slots updated"', async () => {
    const preference = {
      MON: [
        {
          FromHour: 2,
          FromMinutes: 0,
          ToHour: 23,
          ToMinutes: 0,
        },
      ],
    };
    const res = await request(app)
      .put('/v1/doctor/profile/updatePref')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(preference);
    expect(res.body).not.toBeNull();
    expect(res.body.message).toEqual('slots updated');
  });
});

// update doctor clinic timings
describe('POST /v1/doctor/profile/update-clinic-timings', () => {
  test('returns with message "Clinic Timings Updated "', async () => {
    const clinicTimings = {
      clinicId: '6246d54aca72361448e2a568',
      timing: [
        {
          MON: [
            {
              FromHour: 10,
              FromMinutes: 0,
              ToHour: 12,
              ToMinutes: 0,
            },
          ],
        },
      ],
    };
    const res = await request(app)
      .post('/v1/doctor/profile/update-clinic-timings')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(clinicTimings);
    expect(res.body).not.toBeNull();
    expect(res.body.message).toEqual('Clinic Timings Updated for jindal Clinic (id :6246d54aca72361448e2a568)');
  });
});
// update appointment price
describe('POST v1/doctor/profile/update-appointmentPrice', () => {
  test('returns with message "appointmentPrice updated"', async () => {
    const appointmentPrice = {
      appointmentPrice: '6000',
    };
    const res = await request(app)
      .post('/v1/doctor/profile/update-appointmentPrice')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(appointmentPrice);
    expect(res.body).not.toBeNull();
    expect(res.body.message).toEqual('appointmentPrice updated');
  });
});
// fetch payout details
describe('GET /v1/doctor/profile/billing?sortBy=StartDate:desc&limit=20&page=1', () => {
  test('returns payout details', async () => {
    const res = await request(app)
      .get('/v1/doctor/profile/billing?sortBy=StartDate:desc&limit=20&page=1')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`);
    expect(res.body.message).toEqual(
      'Billing details between Sat Jan 01 2022 00:00:00 GMT+0300 (East Europe Standard Time) and Tue Jan 01 2030 00:00:00 GMT+0300 (East Europe Standard Time)'
    );
  });
});
// submit education and experience details
describe('POST /v1/doctor/profile/submit-education-and-experience', () => {
  test('returns with message "Experience and Education Details Submitted!"', async () => {
    const eduANdexpDetails = {
      education: {
        registrationNo: '12356778',
        yearofRegistration: '2000',
        stateMedicalCouncil: 'Arunachal Pradesh Medical Council',
      },
      experience: {
        mainstream: 'MBBS',
        specialization: ['Plastic Surgery'],
        skills: ['Eyees Nose Throat'],
        experience: '8',
      },
    };
    const res = await request(app)
      .post('/v1/doctor/profile/submit-education-and-experience')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(eduANdexpDetails);
    expect(res.body).not.toBeNull();
    if (res.status === httpStatus.CREATED) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('Experience and Education Details Submitted!');
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('these details were already submitted');
    }
  });
});
// send doctor queries
describe.skip('POST /v1/doctor/profile/send-queries', () => {
  test('returns with message "query submitted successfully !"', async () => {
    const query = {
      message: 'any random message',
    };
    const res = await request(app)
      .post('/v1/doctor/profile/send-queries')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send(query);
    expect(res.body).not.toBeNull();
    if (res.status === httpStatus.OK) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('query submitted successfully !');
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(res.body.message).toEqual('failed to send query');
    }
  });
});
// fetch doctor queries
describe('GET /v1/doctor/profile/get-doctor-queries', () => {
  test('returns doctor queries', async () => {
    const res = await request(app)
      .get('/v1/doctor/profile/get-doctor-queries')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`);
    expect(res.body.message).toEqual('success');
  });
});
// fetches doctor stats
describe('GET /v1/doctor/profile/stats', () => {
  test('fetches doctor stats', async () => {
    const res = await request(app)
      .get('/v1/doctor/profile/stats')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`);
    expect(res.body.PATIENTS).not.toBeNull();
  });
});

// get available appointments of doctor
describe('GET /v1/doctor/profile/getappointments', () => {
  test('fetches doctor appointments', async () => {
    const res = await request(app)
      .get('/v1/doctor/profile/getappointments')
      .set('Accept', '*/*')
      .set('Authorization', `Bearer ${doctorToken}`);
    expect(res.body.doctorAuthId).toEqual(authId);
  });
});
