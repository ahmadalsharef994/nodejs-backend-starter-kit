import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createEvent = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    // validate date is greater than current date
    date: Joi.date().greater(new Date()).required(),
    // validate time string in format HH:MM
    time: Joi.string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
    location: Joi.string().required().default('online'),
    link: Joi.string().uri().default('https://NODE_BOILERPLATE.com'),
    image: Joi.required(),
  }),
};

const updateEvent = {
  params: Joi.object().keys({
    eventId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string(),
      description: Joi.string(),
      date: Joi.date().greater(new Date()),
      time: Joi.string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      location: Joi.string(),
      link: Joi.string().uri(),
      image: Joi.any(),
    })
    .min(1),
};

const deleteEvent = {
  params: Joi.object().keys({
    eventId: Joi.string().custom(objectId),
  }),
};

const getAllEvents = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getEventById = {
  params: Joi.object().keys({
    eventId: Joi.string().custom(objectId),
  }),
};

const getEventsByTitle = {
  query: Joi.object().keys({
    title: Joi.string().required(),
  }),
};

// export all
export {
  createEvent,
  updateEvent,
  getEventById,
  getAllEvents,
  deleteEvent,
  getEventsByTitle,
};
