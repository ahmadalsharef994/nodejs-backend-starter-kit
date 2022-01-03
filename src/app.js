const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const promclient = require('prom-client');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const { getClientIp } = require('@supercharge/request-ip');
// const Agenda = require('agenda');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter, otpratelimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

/* const agenda = new Agenda({
  db: { address: dbURL, collection: 'Agenda' },
  processEvery: '20 seconds',
  useUnifiedTopology: true,
});
agenda.define('createSessions', async (job) => {
  const { name } = job.attrs;
  console.log(`Hello ${name} 👋`);
});
(async function () {
  await agenda.start(); // Start Agenda instance
  const date = '2021-11-09T13:44:24.624Z'
  await agenda.schedule(date, 'createSessions', { name: 'Medium' }); // Run the dummy job in 10 minutes and passing data.
})(); */
// set security HTTP headers
app.use(helmet());
// parse json request body
app.use(express.json());
// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));
// sanitize request data
app.use(xss());
app.use(mongoSanitize());
// gzip compression
app.use(compression());
// enable cors
app.use(cors());
app.options('*', cors());
// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);
app.use((req, res, next) => {
  req.ip4 = req.headers['x-forwarded-for'] || getClientIp(req);
  next();
});
// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}
app.use('/v1/auth/doctor/request-otp', otpratelimiter);
app.use('/v1/auth/doctor/resend-otp', otpratelimiter);
app.use('/v1/auth/doctor/forgot-password', otpratelimiter);
app.use('/v1/auth/user/forgot-password', otpratelimiter);
// v1 api routes
app.use('/v1', routes);

// Create a registry and pull default metrics
const register = new promclient.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'medzgo-restAPI',
});

// Enable the collection of default metrics
promclient.collectDefaultMetrics({ register });

app.get('/api-metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found We are Monitoring It ☠️'));
});

// convert error to ApiError, if needed
app.use(errorConverter);
// handle error
app.use(errorHandler);
module.exports = app;
