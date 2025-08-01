/* eslint-disable no-undef */
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import app from './app.js';
import config from './config/config.js';
import appLogger from './config/appLogger.js';
import { chatService } from './services/index.js';

// Database Connection
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  appLogger.info('Connected to MongoDB');
});

// Server Setup
const server = app.listen(config.port, () => {
  appLogger.info(`Listening to port ${config.port}`);
});

// WebSocket (Socket.io) Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  appLogger.info(`User connected: ${socket.id}`);
  
  socket.on('join_appointment', (appointmentId) => socket.join(appointmentId));

  socket.on('send_message', async (data) => {
    if (data.attachments) {
      data.attachments = await chatService.uploadAttachment(data.attachments);
    }
    socket.to(data.appointmentId).emit('receive_message', {
      messageId: uuid(),
      body: data.body,
      contentType: 'text',
      attachments: data.attachments,
      createdAt: Date.now(),
      senderId: data.senderId,
    });
    chatService.saveMessage(data);
  });
  
  app.set('socket.io', io);
});

// Handle graceful shutdown
const exitHandler = () => {
  if (server) {
    server.close(() => {
      appLogger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  appLogger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  appLogger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
