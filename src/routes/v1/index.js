const express = require('express');
const authRouteDoctor = require('./authdoctor.route');
const authRouteUser = require('./authuser.route');
const doctorProfileRoute = require('./doctorprofile.route');
const doctorAppointmentRoute = require('./doctorappointment.route');
const userAppointmentRoute = require('./userappointment.route');
const internalTeamRoute = require('./internalTeam.route');
const userProfileRoute = require('./userprofile.route');
const labTestRoute = require('./labtest.route');
const document = require('./document.route');
const razorpayRoute = require('./razorpay.route');
const couponRoute = require('./coupon.route');
const walletRoute = require('./wallet.route');
const elasticSearchRoute = require('./elasticSearch.route');
const autoReplyRoute = require('./autoReply.route');
const eventRoute = require('./event.route');
const itemRoute = require('./item.route');
const orderRoute = require('./order.route');
const cartRoute = require('./cart.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth/doctor', // Doctor Auth Endpoints
    route: authRouteDoctor,
  },
  {
    path: '/auth/user', // User Auth Endpoints
    route: authRouteUser,
  },
  {
    path: '/internalteam',
    route: internalTeamRoute, // Internal Team API
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
    path: '/doctor/document', // Document Dedicated Route
    route: document,
  },
  {
    path: '/user/profile', // User Profile route
    route: userProfileRoute,
  },
  {
    path: '/user/appointment', // User Appointment Route
    route: userAppointmentRoute,
  },
  {
    path: '/labtest', // LabTests Route
    route: labTestRoute,
  },
  {
    path: '/razorpay',
    route: razorpayRoute,
  },
  {
    path: '/coupons',
    route: couponRoute,
  },
  {
    path: '/wallet',
    route: walletRoute,
  },
  {
    path: '/elasticsearch',
    route: elasticSearchRoute,
  },
  {
    path: '/autoreply',
    route: autoReplyRoute,
  },
  {
    path: '/events',
    route: eventRoute,
  },
  {
    path: '/items',
    route: itemRoute,
  },
  {
    path: '/cart',
    route: cartRoute,
  },
  {
    path: '/orders',
    route: orderRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
