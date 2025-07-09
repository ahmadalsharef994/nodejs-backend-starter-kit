import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createNotification = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    message: Joi.string().required(),
    type: Joi.string().valid('info', 'warning', 'error', 'success').default('info'),
    recipientId: Joi.string().custom(objectId).required(),
  }),
};

const getNotifications = {
  query: Joi.object().keys({
    type: Joi.string().valid('info', 'warning', 'error', 'success'),
    isRead: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getNotification = {
  params: Joi.object().keys({
    notificationId: Joi.string().custom(objectId),
  }),
};

const updateNotification = {
  params: Joi.object().keys({
    notificationId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string(),
      message: Joi.string(),
      type: Joi.string().valid('info', 'warning', 'error', 'success'),
    })
    .min(1),
};

const deleteNotification = {
  params: Joi.object().keys({
    notificationId: Joi.string().custom(objectId),
  }),
};

const markAsRead = {
  params: Joi.object().keys({
    notificationId: Joi.string().custom(objectId),
  }),
};

export {
  createNotification,
  getNotifications,
  getNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
};
