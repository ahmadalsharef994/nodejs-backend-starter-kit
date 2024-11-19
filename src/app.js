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
const config = require('./config/config');
const httpLogger = require('./config/httpLogger');
const { jwtStrategy } = require('./config/jwtStrategy');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

const app = express();

// Logging middleware
if (config.env !== 'test') {
  app.use(httpLogger.successHandler);
  app.use(httpLogger.errorHandler);
}

// Security middleware
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(cors());
app.options('*', cors());

// Body parsing and request setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use((req, res, next) => {
  req.ip4 = req.headers['x-forwarded-for'] || getClientIp(req);
  next();
});

// Authentication middleware
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// API routes
app.use('/v1', routes);

// Monitoring and Metrics
const register = new promclient.Registry();
register.setDefaultLabels({ app: 'HEALTHCARE_APP' });
promclient.collectDefaultMetrics({ register });

app.get('/api-metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

// Error Handling
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found We are Monitoring It ☠️'));
});
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
