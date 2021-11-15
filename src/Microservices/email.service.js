const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

const sendEmail = (to, subject, template, OTP, name) => {
  transport.use(
    'compile',
    hbs({
      viewEngine: {
        extName: '.hbs',
        partialsDir: path.resolve('./src/views'),
        defaultLayout: false,
      },
      viewPath: path.resolve('./src/views'),
      extName: '.hbs',
    })
  );

  const mailOptions = {
    from: config.email.from,
    to,
    subject,
    template,
    context: {
      OTP,
      name,
    },
  };
  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return error;
    }
    return `Email sent:${info.response}`;
  });
};

const sendResetPasswordEmail = async (to, OTP, name) => {
  const subject = 'Reset password';
  const template = 'resetPassword';
  const emaillink = `${OTP}`;
  const userEmail = `${to}`;
  const userName = `${name}`;
  await sendEmail(userEmail, userName, subject, template, emaillink);
};

const sendVerificationEmail = async (to, OTP, name) => {
  const subject = 'Email Verification';
  const template = 'verifyEmail';
  const emaillink = `${OTP}`;
  const userEmail = `${to}`;
  const userName = `${name}`;
  await sendEmail(userEmail, userName, subject, template, emaillink);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
};
