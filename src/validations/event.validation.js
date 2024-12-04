const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

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
  body: Joi.object().keys({
    id: Joi.objectId().required(),
    title: Joi.string(),
    description: Joi.string(),
    // validate date is greater than current date
    date: Joi.date().greater(new Date()),
    // validate time string in format HH:MM
    time: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    location: Joi.string().default('online'),
    link: Joi.string().uri().default('https://NODE_BOILERPLATE.com'),
    image: Joi.any(),
  }),
};

const deleteEvent = {
  params: Joi.object().keys({
    id: Joi.string(),
  }),
};

const getAllEvents = {};

const getEventById = {
  params: Joi.object().keys({
    id: Joi.objectId().required(),
  }),
};

const getEventsByTitle = {
  query: Joi.object().keys({
    title: Joi.string().required(),
  }),
};

// export all
module.exports = {
  createEvent,
  updateEvent,
  getEventById,
  getAllEvents,
  deleteEvent,
  getEventsByTitle,
};
