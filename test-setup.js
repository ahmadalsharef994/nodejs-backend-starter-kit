#!/usr/bin/env node

// Test script to verify ES Module setup
import mongoose from 'mongoose';
import app from './src/app.js';
import config from './src/config/config.js';
import appLogger from './src/config/appLogger.js';

// Test basic imports
console.log('✓ Basic imports working');

// Test config
console.log('✓ Config loaded:', config.env);

// Test logger
appLogger.info('✓ Logger working');

// Test mongoose
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  appLogger.info('✓ MongoDB connected');
}).catch(err => {
  appLogger.error('✗ MongoDB connection failed:', err.message);
});

// Test server
const server = app.listen(config.port, () => {
  appLogger.info(`✓ Server running on port ${config.port}`);
  console.log('✓ All tests passed!');
  
  // Shutdown gracefully
  setTimeout(() => {
    server.close(() => {
      mongoose.disconnect();
      process.exit(0);
    });
  }, 2000);
});

server.on('error', (err) => {
  appLogger.error('✗ Server error:', err.message);
  process.exit(1);
});
