import Joi from 'joi';

const searchUsers = {
  query: Joi.object().keys({
    q: Joi.string().required(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const searchEvents = {
  query: Joi.object().keys({
    q: Joi.string().required(),
    category: Joi.string(),
    date: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const globalSearch = {
  query: Joi.object().keys({
    q: Joi.string().required(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSearchSuggestions = {
  query: Joi.object().keys({
    q: Joi.string().required(),
    type: Joi.string().valid('users', 'events', 'all'),
  }),
};

export {
  searchUsers,
  searchEvents,
  globalSearch,
  getSearchSuggestions,
};
