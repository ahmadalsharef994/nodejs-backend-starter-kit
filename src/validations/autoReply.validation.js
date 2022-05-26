const Joi = require('joi');

const autoReplyUser = {
  body: Joi.object().keys({}),
};

const autoReplySymptoms = {
  body: Joi.object().keys({
    symptoms: Joi.array().items(Joi.string()).min(2).max(3),
  }),
};

module.exports = {
  autoReplyUser,
  autoReplySymptoms,
};
