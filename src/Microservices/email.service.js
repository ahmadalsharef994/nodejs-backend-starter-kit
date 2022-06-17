const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const { env } = require('process');
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
const mail = async (options) => {
  return transport
    .sendMail(options)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

const sendEmailQueries = async (emailbody, TicketNo) => {
  const options = {
    from: process.env.EMAIL_FROM,
    to: process.env.SUPPORT_MAIL,
    subject: TicketNo,
    text: emailbody,
  };
  const result = mail(options);
  result.then((res) => {
    return res.response.response;
  });
  return result;
};
const sendEmailQueriesUser = async (recivermail, query, TicketNo) => {
  const options = {
    from: process.env.EMAIL_FROM,
    to: recivermail,
    subject: TicketNo,
    text: `sorry for the inconvenience\n we have opened a ticket for your query"${query}".Your ticket number is${TicketNo} , 
           our team will get back to you soon \n \nfor furthur details contct at ${env.SUPPORT_MAIL} `,
  };
  const result = mail(options);
  result.then((res) => {
    return res.response.response;
  });
  return result;
};
const sendEmail = async (to, name, subject, template, OTP) => {
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
      to,
    },
  };
  const response = await transport
    .sendMail(mailOptions)
    .then((result) => {
      return result;
    })
    .catch((err) => {
      return err;
    });
  const status = response.response;
  if (status === '250 Message received') {
    return true;
  }
  return response;
};

const sendResetPasswordEmail = async (to, name, OTP) => {
  const subject = 'Reset password';
  const template = 'resetPassword';
  const emaillink = `${OTP}`;
  const userEmail = `${to}`;
  const userName = `${name}`;
  await sendEmail(userEmail, userName, subject, template, emaillink);
};

const sendVerificationEmail = async (to, name, OTP) => {
  const subject = 'Email Verification';
  const template = 'verifyEmail';
  const emaillink = `${OTP}`;
  const userEmail = `${to}`;
  const userName = `${name}`;
  const status = await sendEmail(userEmail, userName, subject, template, emaillink);
  return status;
};

const sendLabTestOrderDetails = async (to, name, OTP) => {
  const subject = 'Lab Test Booked Successfully';
  const template = 'labTestBooking';
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
  sendLabTestOrderDetails,
  sendEmailQueries,
  sendEmailQueriesUser,
};
