const express = require('express');
const authRouteDoctor = require('./authdoctor.route');
const authRouteUser = require('./authuser.route');
const doctorProfileRoute = require('./doctorprofile.route');
const internalTeamRoute = require('./internalTeam.route');
const document = require('./document.route');

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
    path: '/doctor/document',
    route: document, // Document upload
  },
  {
    path: '/user',
    route: doctorProfileRoute, // Change it to User route when made
  },
  {
    path: '/auth/user', // User Auth Endpoints
    route: authRouteUser,
  },
  {
    path: '/internalteam',
    route: internalTeamRoute, // Internal Team API
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
