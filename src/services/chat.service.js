/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import dotenv from 'dotenv';
import httpStatus from 'http-status';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';

import User from '../models/user.model.js';
import ApiError from '../utils/ApiError.js';
import appLogger from '../config/appLogger.js';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Handle user joining a chat room
 * @param {string} userId
 * @param {string} roomId
 * @returns {Promise<void>}
 */
const joinRoom = async (userId, roomId) => {
  try {
    // Add user to room logic here
    appLogger.info(`User ${userId} joined room ${roomId}`);
  } catch (error) {
    appLogger.error(`Error joining room: ${error.message}`);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to join room');
  }
};

/**
 * Handle user leaving a chat room
 * @param {string} userId
 * @param {string} roomId
 * @returns {Promise<void>}
 */
const leaveRoom = async (userId, roomId) => {
  try {
    // Remove user from room logic here
    appLogger.info(`User ${userId} left room ${roomId}`);
  } catch (error) {
    appLogger.error(`Error leaving room: ${error.message}`);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to leave room');
  }
};

/**
 * Handle sending a message
 * @param {string} userId
 * @param {string} roomId
 * @param {string} message
 * @returns {Promise<Object>}
 */
const sendMessage = async (userId, roomId, message) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }

    const messageData = {
      id: uuidv4(),
      userId,
      username: user.name,
      message,
      timestamp: new Date(),
      roomId,
    };

    appLogger.info(`Message sent by ${userId} in room ${roomId}: ${message}`);
    return messageData;
  } catch (error) {
    appLogger.error(`Error sending message: ${error.message}`);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send message');
  }
};

/**
 * Upload chat attachments
 * @param {Array} files
 * @returns {Promise<Array>}
 */
const uploadAttachment = async (files) => {
  const urls = [];
  
  for (const file of files) {
    const uploadResponse = await cloudinary.uploader.upload(file, {
      folder: 'chat-attachments',
      resource_type: 'auto',
      overwrite: false,
    });
    urls.push(uploadResponse.secure_url);
  }

  return urls;
};

export {
  joinRoom,
  leaveRoom,
  sendMessage,
  uploadAttachment,
};
