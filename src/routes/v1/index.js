const express = require('express');
const authRouteDoctor = require('./authdoctor.route');
const authRouteUser = require('./authuser.route');
const doctorRoute = require('./doctor.route');
const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth/doctor', // doctor Auth Endpoints
    route: authRouteDoctor,
  },
  {
    path: '/auth/user', // User Auth Endpoints
    route: authRouteUser,
  },
  {
    path: '/doctor', //Doctor Routes
    route: doctorRoute, 
  },
  {
    path: '/user',
    route: doctorRoute, //Change it to User route when made
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
