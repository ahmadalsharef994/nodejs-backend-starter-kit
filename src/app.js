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
const bodyParser = require('body-parser');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter, otpLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());
// parse json request body
app.use(express.json());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

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
app.use('/v1/auth/doctor/request-otp', otpLimiter);
app.use('/v1/auth/doctor/resend-otp', otpLimiter);
app.use('/v1/auth/doctor/forgot-password', otpLimiter);
app.use('/v1/auth/user/forgot-password', otpLimiter);
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
