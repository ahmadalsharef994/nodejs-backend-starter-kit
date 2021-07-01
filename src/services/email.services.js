const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');
const hbs = require("nodemailer-express-handlebars");
const path = require("path");


const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}


const sendEmail = (to, subject, template , OTP) => {
 transport.use('compile', hbs({
    viewEngine: 'express-handlebars',
    viewPath: './src/views/',
    viewEngine: {
        extName: ".hbs",
        partialsDir: path.resolve('./src/views'),
        defaultLayout: false,
    },
    viewPath: path.resolve('./src/views'),
    extName: ".hbs",
}));
        
const mailOptions = {
  from: config.email.from,
  to ,
  subject, 
  template,
  context: {                  
    OTP : OTP
  }};
  transport.sendMail(mailOptions, (error, info) => {
  if (error) {
     console.log(error);
  } else {
      console.log("Email sent: " + info.response , OTP);
           
    }});

 }; 

const sendResetPasswordEmail = async (to,OTP) => {
  const subject = 'Reset password';
  const template = "index";
  await sendEmail(to, subject, template,OTP);
};

const sendVerificationEmail = async (to,OTP) => {
  const subject = 'Email Verification';
  const template = "index";
  await sendEmail(to, subject, template,OTP);
};



module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail
  
  
};
