import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { notificationService } from '../services/notification.service.js';
import pick from '../utils/pick.js';
import ApiError from '../utils/ApiError.js';

const createNotification = catchAsync(async (req, res) => {
  const notificationData = pick(req.body, ['title', 'message', 'type', 'recipientId']);
  notificationData.createdBy = req.user.id;
  const notification = await notificationService.createNotification(notificationData);
  res.status(httpStatus.CREATED).send(notification);
});

const getNotifications = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['type', 'isRead']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  filter.recipientId = req.user.id;
  const result = await notificationService.queryNotifications(filter, options);
  res.send(result);
});

const getNotification = catchAsync(async (req, res) => {
  const notification = await notificationService.getNotificationById(req.params.notificationId);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  res.send(notification);
});

const updateNotification = catchAsync(async (req, res) => {
  const updateData = pick(req.body, ['title', 'message', 'type']);
  const notification = await notificationService.updateNotificationById(req.params.notificationId, updateData);
  res.send(notification);
});

const deleteNotification = catchAsync(async (req, res) => {
  await notificationService.deleteNotificationById(req.params.notificationId);
  res.status(httpStatus.NO_CONTENT).send();
});

const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.notificationId);
  res.send(notification);
});

const markAllAsRead = catchAsync(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);
  res.status(httpStatus.OK).send({ message: 'All notifications marked as read' });
});

const getUnreadCount = catchAsync(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);
  res.send({ count });
});

export {
  createNotification,
  getNotifications,
  getNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
