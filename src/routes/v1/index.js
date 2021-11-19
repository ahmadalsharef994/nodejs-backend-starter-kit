const express = require('express');
const authRouteDoctor = require('./authdoctor.route');
const authRouteUser = require('./authuser.route');
const doctorProfileRoute = require('./doctorprofile.route');
const doctorAppointmentRoute = require('./doctorappointment.route');
const userAppointmentRoute = require('./userappointment.route');
const internalTeamRoute = require('./internalTeam.route');
const userProfileRoute = require('./userprofile.route');
const document = require('./document.route');
const chatRoute = require('./chat.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth/doctor', // doctor Auth Endpoints
    route: authRouteDoctor,
  },
  {
    path: '/doctor/profile', // Doctor Profile Route
    route: doctorProfileRoute,
  },
  {
    path: '/doctor/appointment', // Doctor Appointment Route
    route: doctorAppointmentRoute,
  },
  {
    path: '/doctor/document',
    route: document, // Document upload
  },
  {
    path: '/user',
    route: userProfileRoute,
  },
  {
    path: '/auth/user', // User Auth Endpoints
    route: authRouteUser,
  },
  {
    path: '/user/appointment', // User Appointment Route
    route: userAppointmentRoute,
  },
  {
    path: '/internalteam',
    route: internalTeamRoute, // Internal Team API
  },
  {
    path: '/chat',
    route: chatRoute, // chat API
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
