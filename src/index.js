const mongoose = require('mongoose');
// const Agenda = require('agenda');
const { Server } = require('socket.io');
const uuid = require('uuid');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { chatService } = require('./services');

// const dbURL = config.mongoose.url;
// const agenda = new Agenda({
//   db: { address: dbURL, collection: 'jobs' },
//   processEvery: '20 seconds',
//   useUnifiedTopology: true,
// });

// global variable
// const getzohoToken = () => {
//   return axios
//     .post(
//       `https://accounts.zoho.in/oauth/v2/token?refresh_token=${process.env.REFRESH_TOKEN}&grant_type=refresh_token&client_id=${process.env.client_id}&client_secret=${process.env.client_secret}`
//     )
//     .then((response) => {
//       return response.data.access_token;
//     })
//     .catch((err) => {
//       return err;
//     });
// };

// getzohoToken().then((data) => {
//   global.zohoToken = data;
// });

// setInterval(async () => {
//   global.zohoToken = await getzohoToken();
// }, 600000);

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');
  // agenda.start();
  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
  // socket.io
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  io.on('connection', (socket) => {
    logger.info(`User Connected to io: ${socket.id}`);
    socket.on('join_appointment', (appointmentId) => socket.join(appointmentId));
    // eslint-disable-next-line no-return-await
    socket.on('send_message', async (data) => {
      if (data.attachments) {
        // eslint-disable-next-line no-param-reassign
        data.attachments = await chatService.uploadAttachment(data.attachments);
      }
      socket.to(data.appointmentId).emit('receive_message', {
        messageId: uuid(),
        body: data.body,
        contentType: 'text',
        attachments: data.attachments, // data.attachments: array of URLs
        createdAt: Date.now(),
        senderId: data.senderId,
      });
      chatService.saveMessage(data); // this is synchronous ... we won't wait until the message is saved in DB
    });
    app.set('socket.io', io);
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
