const httpStatus = require('http-status');
// const { env } = require('process');
const sgMail = require('@sendgrid/mail');
const config = require('../config/config');
// const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

sgMail.setApiKey('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');

/* istanbul ignore next */
// if (config.env !== 'test') {
//   sgMail
//     .ping()
//     .then(() => logger.info('Connected to email server'))
//     .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SendGrid API key'));
// }

// const sendEmailQueries = async (emailbody, TicketNo) => {
//   const msg = {
//     to: 'ahmad.kraleba@gmail.com',
//     from: process.env.EMAIL_FROM,
//     subject: TicketNo,
//     text: emailbody,
//   };
//   const result = sgMail.send(msg);
//   result
//     .then((res) => {
//       return res;
//     })
//     .catch((err) => {
//       throw new ApiError(httpStatus.BAD_GATEWAY, err);
//     });
//   return result;
// };

const appointmentBookingMail = async (appointmentdetails) => {
  const emailbody = `Congratulations your order was booked !
  Appointment details:
  Orderid :${appointmentdetails._id}
  Booking date :${appointmentdetails.Date}
  Appointment starts at:${new Date(appointmentdetails.StartTime).toLocaleTimeString()};
  Appointment ends at:${new Date(appointmentdetails.EndTime).toLocaleTimeString()}
  
  Thank you ,
  Team medzgo.`;

  const msg = {
    to: appointmentdetails.patientMail,
    from: process.env.EMAIL_FROM,
    subject: 'Booking Success',
    text: emailbody,
  };
  const result = sgMail.send(msg);
  result
    .then((res) => {
      return res;
    })
    .catch((err) => {
      throw new ApiError(httpStatus.BAD_GATEWAY, err);
    });
  return result;
};

const bookingCancellationMail = async (appointmentdetails) => {
  const emailbody = `We regret to inform you that your appointment on ${appointmentdetails.Date} , appointment id${appointmentdetails._id} has been cancelled since doctor is not available at this time 
  You will get your refund in 7 working days in wallet or given bank account.
  
  Thank you ,
  Team medzgo.
  `;

  const msg = {
    to: appointmentdetails.patientMail,
    from: process.env.EMAIL_FROM,
    subject: 'Cancelled Appointment',
    text: emailbody,
  };
  const result = sgMail.send(msg);
  result
    .then((res) => {
      return res;
    })
    .catch((err) => {
      throw new ApiError(httpStatus.BAD_GATEWAY, err);
    });
  return result;
};

// const sendEmailQueriesUser = async (recivermail, query, TicketNo) => {
//   const msg = {
//     to: recivermail,
//     from: process.env.EMAIL_FROM,
//     subject: TicketNo,
//     text: `sorry for the inconvenience\n\nwe have opened a ticket for your query"${query}".Your ticket number is ${TicketNo}\nour team will get back to you soon \n \nfor furthur details contct at ${env.SUPPORT_MAIL} `,
//   };
//   const result = sgMail.send(msg);
//   result
//     .then((res) => {
//       return res;
//     })
//     .catch((err) => {
//       throw new ApiError(httpStatus.BAD_GATEWAY, err);
//     });
//   return result;
// };

// const sendRescheduledEmail = async (recivermail, Appointmenttime, Reason, appointmentId) => {
//   const msg = {
//     to: recivermail,
//     from: process.env.EMAIL_FROM,
//     subject: 'Rescheduled Appointment',
//     text: `hi !\nthis mail is to inform you that your appointment (${appointmentId}) is rescheduled since doctor is not available at this time \n\nReason:${Reason}\n\nNew AppointmentTiming:${Appointmenttime}\n\n\nThank you Team Medzgo`,
//   };
//   const result = sgMail.send(msg);
//   result
//     .then((res) => {
//       return res;
//     })
//     .catch((err) => {
//       throw new ApiError(httpStatus.BAD_GATEWAY, err);
//     });
//   return result;
// };

const sendEmail = async (to, name, subject, template, OTP) => {
  const msg = {
    to,
    from: config.email.from,
    subject,
    text: `${OTP}`, // plain text version of the email body
    templateId: '1c970714-ab3a-4729-a550-fed0af27c7ee',
    dynamicTemplateData: {
      OTP,
      name,
      to,
    },
  };
  const response = await sgMail
    .send(msg)
    .then((result) => {
      return result;
    })
    .catch((err) => {
      throw new ApiError(httpStatus.BAD_GATEWAY, err);
    });
  const status = response[0].statusCode;
  if (status === 202) {
    return true;
  }
  return response;
};

const sendResetPasswordEmail = async (to, name, OTP) => {
  const subject = 'Reset password';
  const template = 'resetPassword';
  const emaillink = OTP;
  const userEmail = to;
  const userName = name;
  await sendEmail(userEmail, userName, subject, template, emaillink);
};

const sendVerificationEmail = async (to, name, OTP) => {
  const subject = 'Email Verification';
  const template = 'verifyEmail';
  const emaillink = OTP;
  const userEmail = to;
  const userName = name;
  const status = await sendEmail(userEmail, userName, subject, template, emaillink);
  return status;
};

// const sendLabTestOrderDetails = async (to, name, OTP) => {
//   const subject = 'Lab Test Booked Successfully';
//   const template = 'labTestBooking';
//   const emaillink = `${OTP}`;
//   const userEmail = `${to}`;
//   const userName = name;
//   await sendEmail(userEmail, userName, subject, template, emaillink);
// };

module.exports = {
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  // sendLabTestOrderDetails,
  // sendEmailQueries,
  // sendEmailQueriesUser,
  // sendRescheduledEmail,
  appointmentBookingMail,
  bookingCancellationMail,
};
