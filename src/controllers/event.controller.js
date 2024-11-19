const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { eventService, authService } = require('../services');
const pick = require('../utils/pick');

const createEvent = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const eventData = pick(req.body, ['title', 'description', 'date', 'time', 'location', 'link']);
  eventData.createdBy = AuthData._id;
  const event = await eventService.createEvent(eventData);
  if (!event) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'Something went wrong' });
  }
  return res.status(httpStatus.OK).json({ message: 'Event created successfully', data: event });
});

const updateEvent = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const eventData = pick(req.body, ['name', 'description', 'date', 'time', 'location', 'link']);
  eventData.createdBy = AuthData._id;
  const event = await eventService.updateEvent(req.body.id, eventData);
  if (!event) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'Event not found' });
  }
  return res.status(httpStatus.OK).json({ message: 'event updated', data: event });
});

const deleteEvent = catchAsync(async (req, res) => {
  const event = await eventService.deleteEvent(req.query.id);
  if (!event) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'Event not found' });
  }
  return res.status(httpStatus.OK).json({ message: 'event deleted', data: event });
});

const getAllEvents = catchAsync(async (req, res) => {
  const events = await eventService.getAllEvents();
  if (events.length === 0) {
    return res.status(httpStatus.OK).json({ message: 'no events to show', data: [] });
  }
  return res.status(httpStatus.OK).json({ message: 'success', data: events });
});

const getEventById = catchAsync(async (req, res) => {
  const event = await eventService.getEventById(req.query.id);
  if (!event) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'Event not found' });
  }
  return res.status(httpStatus.OK).json({ message: 'event fount', data: event });
});

const getEventsByTitle = catchAsync(async (req, res) => {
  const events = await eventService.getEventsByTitle(req.query.title);
  if (events.length === 0) {
    return res.status(httpStatus.OK).json({ message: 'no events to show', data: [] });
  }
  return res.status(httpStatus.OK).json({ message: 'event found', data: events });
});

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByTitle,
};
