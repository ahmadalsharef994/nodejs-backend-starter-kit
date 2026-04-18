import express from "express";
import helmet from "helmet";
import promclient from "prom-client";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { version } = require("../package.json");
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import cors from "cors";
import passport from "passport";
import httpStatus from "http-status";
import { getClientIp } from "@supercharge/request-ip";
import config from "./config/config.js";
import {
  successHandler,
  errorHandler as httpErrorHandler,
} from "./config/httpLogger.js";
import jwtStrategy from "./config/jwtStrategy.js";
import routes from "./routes/v1/index.js";
import { errorConverter, errorHandler } from "./middlewares/error.js";
import ApiError from "./utils/ApiError.js";

const app = express();

// Logging middleware
if (config.env !== "test") {
  app.use(successHandler);
  app.use(httpErrorHandler);
}

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(cors());
app.options(/(.*)/, cors());

// Body parsing and request setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use((req, res, next) => {
  req.ip4 = req.headers["x-forwarded-for"] || getClientIp(req);
  next();
});

// Authentication middleware
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    version,
  });
});

// API routes
app.use("/v1", routes);

// Monitoring and Metrics
const register = new promclient.Registry();
register.setDefaultLabels({ app: "NODE_BOILERPLATE" });
promclient.collectDefaultMetrics({ register });

app.get("/api-metrics", async (req, res) => {
  const secret = req.headers["x-metrics-secret"];
  if (config.env === "production" && secret !== config.metricsSecret) {
    return res.status(403).json({ message: "Forbidden" });
  }
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});

// Error Handling
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found We are Monitoring It ☠️"));
});
app.use(errorConverter);
app.use(errorHandler);

export default app;
