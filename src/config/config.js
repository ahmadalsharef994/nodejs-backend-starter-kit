import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Joi from 'joi';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    MONGODB_URL: Joi.string().required().description('MongoDB URL'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number().default(10),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number().default(10),
    
    // Email configuration
    SMTP_HOST: Joi.string().description('SMTP server host'),
    SMTP_PORT: Joi.number().description('SMTP server port'),
    SMTP_USERNAME: Joi.string().description('SMTP username'),
    SMTP_PASSWORD: Joi.string().description('SMTP password'),
    EMAIL_FROM: Joi.string().description('Default from email address'),
    
    // SMS configuration (Twilio)
    TWILIO_ACCOUNT_SID: Joi.string().description('Twilio Account SID'),
    TWILIO_AUTH_TOKEN: Joi.string().description('Twilio Auth Token'),
    TWILIO_PHONE_NUMBER: Joi.string().description('Twilio phone number'),
    
    // Cloudinary configuration
    CLOUDINARY_CLOUD_NAME: Joi.string().description('Cloudinary cloud name'),
    CLOUDINARY_API_KEY: Joi.string().description('Cloudinary API key'),
    CLOUDINARY_API_SECRET: Joi.string().description('Cloudinary API secret'),
    
    // Razorpay configuration
    RAZORPAY_KEY_ID: Joi.string().description('Razorpay key ID'),
    RAZORPAY_KEY_SECRET: Joi.string().description('Razorpay key secret'),
    
    // Elasticsearch configuration
    ELASTICSEARCH_URL: Joi.string().description('Elasticsearch URL'),
    ELASTICSEARCH_USERNAME: Joi.string().description('Elasticsearch username'),
    ELASTICSEARCH_PASSWORD: Joi.string().description('Elasticsearch password'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGODB_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
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
  sms: {
    twilio: {
      accountSid: envVars.TWILIO_ACCOUNT_SID,
      authToken: envVars.TWILIO_AUTH_TOKEN,
      phoneNumber: envVars.TWILIO_PHONE_NUMBER,
    },
  },
  cloudinary: {
    cloudName: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },
  razorpay: {
    keyId: envVars.RAZORPAY_KEY_ID,
    keySecret: envVars.RAZORPAY_KEY_SECRET,
  },
  elasticsearch: {
    url: envVars.ELASTICSEARCH_URL,
    username: envVars.ELASTICSEARCH_USERNAME,
    password: envVars.ELASTICSEARCH_PASSWORD,
  },
};
