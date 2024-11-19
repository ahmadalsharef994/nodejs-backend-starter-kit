const { Event } = require('../models');

const createEvent = async (eventData) => {
  const event = await Event.create(eventData);
  return event;
};

const updateEvent = async (id, eventData) => {
  const event = await Event.findByIdAndUpdate(id, eventData, { new: true }); // new: true returns the updated document
  return event;
};

const deleteEvent = async (id) => {
  const event = await Event.findByIdAndDelete(id);
  return event;
};

const getAllEvents = async () => {
  const events = await Event.find({});
  return events;
};

const getEventById = async (id) => {
  const event = await Event.findById(id);
  return event;
};

const getEventsByTitle = async (title) => {
  const events = await Event.find({ title: { $regex: title, $options: 'i' } });

  return events;
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByTitle,
};
