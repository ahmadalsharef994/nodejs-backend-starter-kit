import express from 'express';
import authRoute from './auth.route.js';
import userRoute from './user.route.js';
import docsRoute from './docs.route.js';
import eventRoute from './event.route.js';
import notificationRoute from './notification.route.js';
import paymentRoute from './payment.route.js';
import searchRoute from './search.route.js';
import config from '../../config/config.js';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/events',
    route: eventRoute,
  },
  {
    path: '/notifications',
    route: notificationRoute,
  },
  {
    path: '/payments',
    route: paymentRoute,
  },
  {
    path: '/search',
    route: searchRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;