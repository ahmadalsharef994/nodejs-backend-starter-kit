// auth.test.js
const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');

// Sample user data for testing
const userData = { fullname: 'User Test', email: 'user@test.com', password: 'Passw0rd!', mobile: '1234567890', role: 'user' };
const doctorData = { fullname: 'Doctor Test', email: 'doctor@test.com', password: 'Passw0rd!', mobile: '1234567891', role: 'doctor' };
const adminData = { fullname: 'Admin Test', email: 'admin@test.com', password: 'Passw0rd!', mobile: '1234567892', role: 'admin' };

// Set up in-memory database for testing
setupTestDB();

describe('Auth routes', () => {
  describe('Registration', () => {
    it('should register a user successfully', async () => {
      const res = await request(app).post('/v1/auth/register').send(userData).expect(httpStatus.CREATED);
      expect(res.body.user).toHaveProperty('email', userData.email);
      expect(res.body.user).toHaveProperty('role', userData.role);
    });

    it('should register a doctor successfully', async () => {
      const res = await request(app).post('/v1/auth/register').send(doctorData).expect(httpStatus.CREATED);
      expect(res.body.user).toHaveProperty('email', doctorData.email);
      expect(res.body.user).toHaveProperty('role', doctorData.role);
    });

    it('should register an admin successfully', async () => {
      const res = await request(app).post('/v1/auth/register').send(adminData).expect(httpStatus.CREATED);
      expect(res.body.user).toHaveProperty('email', adminData.email);
      expect(res.body.user).toHaveProperty('role', adminData.role);
    });
  });

  describe('Login', () => {
    it('should login user and return a token', async () => {
      await request(app).post('/v1/auth/register').send(userData);
      const res = await request(app).post('/v1/auth/login').send({ email: userData.email, password: userData.password, role: userData.role }).expect(httpStatus.OK);
      expect(res.body).toHaveProperty('token');
    });

    it('should login doctor and return a token', async () => {
      await request(app).post('/v1/auth/register').send(doctorData);
      const res = await request(app).post('/v1/auth/login').send({ email: doctorData.email, password: doctorData.password, role: doctorData.role }).expect(httpStatus.OK);
      expect(res.body).toHaveProperty('token');
    });

    it('should login admin and return a token', async () => {
      await request(app).post('/v1/auth/register').send(adminData);
      const res = await request(app).post('/v1/auth/login').send({ email: adminData.email, password: adminData.password, role: adminData.role }).expect(httpStatus.OK);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 401 error if credentials are incorrect', async () => {
      await request(app).post('/v1/auth/register').send(userData);
      await request(app).post('/v1/auth/login').send({ email: userData.email, password: 'wrongPassword', role: userData.role }).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('Retrieve Profile', () => {
    it('should retrieve user profile', async () => {
      await request(app).post('/v1/auth/register').send(userData);
      const loginRes = await request(app).post('/v1/auth/login').send({ email: userData.email, password: userData.password, role: userData.role }).expect(httpStatus.OK);
      const res = await request(app).get('/v1/auth/profile').set('Authorization', `Bearer ${loginRes.body.token}`).expect(httpStatus.OK);
      expect(res.body).toHaveProperty('email', userData.email);
    });

    it('should retrieve doctor profile', async () => {
      await request(app).post('/v1/auth/register').send(doctorData);
      const loginRes = await request(app).post('/v1/auth/login').send({ email: doctorData.email, password: doctorData.password, role: doctorData.role }).expect(httpStatus.OK);
      const res = await request(app).get('/v1/auth/profile').set('Authorization', `Bearer ${loginRes.body.token}`).expect(httpStatus.OK);
      expect(res.body).toHaveProperty('email', doctorData.email);
    });

    it('should retrieve admin profile', async () => {
      await request(app).post('/v1/auth/register').send(adminData);
      const loginRes = await request(app).post('/v1/auth/login').send({ email: adminData.email, password: adminData.password, role: adminData.role }).expect(httpStatus.OK);
      const res = await request(app).get('/v1/auth/profile').set('Authorization', `Bearer ${loginRes.body.token}`).expect(httpStatus.OK);
      expect(res.body).toHaveProperty('email', adminData.email);
    });
  });

  describe('Logout', () => {
    it('should log out user successfully', async () => {
      await request(app).post('/v1/auth/register').send(userData);
      const loginRes = await request(app).post('/v1/auth/login').send({ email: userData.email, password: userData.password, role: userData.role }).expect(httpStatus.OK);
      await request(app).post('/v1/auth/logout').set('Authorization', `Bearer ${loginRes.body.token}`).expect(httpStatus.OK);
    });

    it('should log out doctor successfully', async () => {
      await request(app).post('/v1/auth/register').send(doctorData);
      const loginRes = await request(app).post('/v1/auth/login').send({ email: doctorData.email, password: doctorData.password, role: doctorData.role }).expect(httpStatus.OK);
      await request(app).post('/v1/auth/logout').set('Authorization', `Bearer ${loginRes.body.token}`).expect(httpStatus.OK);
    });

    it('should log out admin successfully', async () => {
      await request(app).post('/v1/auth/register').send(adminData);
      const loginRes = await request(app).post('/v1/auth/login').send({ email: adminData.email, password: adminData.password, role: adminData.role }).expect(httpStatus.OK);
      await request(app).post('/v1/auth/logout').set('Authorization', `Bearer ${loginRes.body.token}`).expect(httpStatus.OK);
    });
  });

  afterAll(async () => {
    // Close any lingering connections or servers
    await new Promise((resolve) => setTimeout(() => resolve(), 500));
  });
});
