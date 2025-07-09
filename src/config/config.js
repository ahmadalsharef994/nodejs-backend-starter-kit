import dotenv from "dotenv";
import path from "path";
import Joi from "joi";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description("Mongo DB url"),
    JWT_SECRET: Joi.string().required().description("JWT secret key"),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description("minutes after which access tokens expire"),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description("days after which refresh tokens expire"),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which reset password token expires"),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description("minutes after which verify email token expires"),
    SMTP_HOST: Joi.string().description("server that will send the emails"),
    SMTP_PORT: Joi.number().description("port to connect to the email server"),
    SMTP_USERNAME: Joi.string().description("username for email server"),
    SMTP_PASSWORD: Joi.string().description("password for email server"),
    EMAIL_FROM: Joi.string().description(
      "the from field in the emails sent by the app",
    ),
    CLIENTURL: Joi.string().description("client url"),
    SECRETADMINKEY: Joi.string().description("secret admin key"),
    REDIS_HOST: Joi.string().description("redis host"),
    REDIS_PORT: Joi.number().description("redis port"),
    REDIS_PASSWORD: Joi.string().description("redis password"),
    SUPPORT_MAIL: Joi.string().description("support email"),
    SLOT_TIME: Joi.number().description("slot time in minutes"),

    // SMS Configuration
    SMS_API_KEY: Joi.string().description("SMS API key"),
    SMS_API_SECRET: Joi.string().description("SMS API secret"),
    SMS_FROM: Joi.string().description("SMS from number"),

    // Elasticsearch Configuration
    ELASTIC_USERNAME: Joi.string().description("Elasticsearch username"),
    ELASTIC_PASSWORD: Joi.string().description("Elasticsearch password"),
    ELASTIC_URL: Joi.string().description("Elasticsearch URL"),

    // Razorpay Configuration
    RAZORPAY_KEY_ID: Joi.string().description("Razorpay key ID"),
    RAZORPAY_KEY_SECRET: Joi.string().description("Razorpay key secret"),

    // Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: Joi.string().description("Cloudinary cloud name"),
    CLOUDINARY_API_KEY: Joi.string().description("Cloudinary API key"),
    CLOUDINARY_API_SECRET: Joi.string().description("Cloudinary API secret"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  clientUrl: envVars.CLIENTURL,
  secretAdminKey: envVars.SECRETADMINKEY,
  supportMail: envVars.SUPPORT_MAIL,
  slotTime: envVars.SLOT_TIME,
  baseUrl: `http://localhost:${envVars.PORT}`,

  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === "test" ? "-test" : ""),
    options: {
      // Remove deprecated options
      // useCreateIndex: true,
      // useUnifiedTopology: true,
      // useNewUrlParser: true,
      // useFindAndModify: false,
    },
  },

  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes:
      envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },

  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },

  redis: {
    host: envVars.REDIS_HOST,
    port: envVars.REDIS_PORT,
    password: envVars.REDIS_PASSWORD,
  },

  sms: {
    apiKey: envVars.SMS_API_KEY,
    apiSecret: envVars.SMS_API_SECRET,
    from: envVars.SMS_FROM,
  },

  elasticsearch: {
    username: envVars.ELASTIC_USERNAME,
    password: envVars.ELASTIC_PASSWORD,
    url: envVars.ELASTIC_URL,
  },

  razorpay: {
    keyId: envVars.RAZORPAY_KEY_ID,
    keySecret: envVars.RAZORPAY_KEY_SECRET,
  },

  cloudinary: {
    cloudName: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },
};

export default config;
