import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { eventService } from '../services/event.service.js';
import pick from '../utils/pick.js';

const createEvent = catchAsync(async (req, res) => {
  const eventData = pick(req.body, ['title', 'description', 'date', 'time', 'location', 'link']);
  eventData.createdBy = req.user.id;
  const event = await eventService.createEvent(eventData);
  if (!event) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'Something went wrong' });
  }
  return res.status(httpStatus.OK).json({ message: 'Event created successfully', data: event });
});

const updateEvent = catchAsync(async (req, res) => {
  const eventData = pick(req.body, ['title', 'description', 'date', 'time', 'location', 'link']);
  eventData.updatedBy = req.user.id;
  const event = await eventService.updateEvent(req.params.eventId, eventData);
  if (!event) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'Event not found' });
  }
  return res.status(httpStatus.OK).json({ message: 'event updated', data: event });
});

const deleteEvent = catchAsync(async (req, res) => {
  const event = await eventService.deleteEvent(req.params.eventId);
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
  const event = await eventService.getEventById(req.params.eventId);
  if (!event) {
    return res.status(httpStatus.NOT_FOUND).json({ message: 'Event not found' });
  }
  return res.status(httpStatus.OK).json({ message: 'event found', data: event });
});

const getEventsByTitle = catchAsync(async (req, res) => {
  const events = await eventService.getEventsByTitle(req.query.title);
  if (events.length === 0) {
    return res.status(httpStatus.OK).json({ message: 'no events to show', data: [] });
  }
  return res.status(httpStatus.OK).json({ message: 'event found', data: events });
});

export {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByTitle,
};
