const Joi = require('joi');

const PreferenceDetails = {
  body: Joi.object().keys({
    MON: Joi.object().keys({
      FromHour: Joi.number().integer().min(0).max(23),
      FromMinutes: Joi.number().integer().min(0).max(59),
      ToHour: Joi.number().integer().min(0).max(23),
      ToMinutes: Joi.number().integer().min(0).max(59),
    }),
    TUE: Joi.object().keys({
      FromHour: Joi.number().integer().min(0).max(23),
      FromMinutes: Joi.number().integer().min(0).max(59),
      ToHour: Joi.number().integer().min(0).max(23),
      ToMinutes: Joi.number().integer().min(0).max(59),
    }),
    WED: Joi.object().keys({
      FromHour: Joi.number().integer().min(0).max(23),
      FromMinutes: Joi.number().integer().min(0).max(59),
      ToHour: Joi.number().integer().min(0).max(23),
      ToMinutes: Joi.number().integer().min(0).max(59),
    }),
    THU: Joi.object().keys({
      FromHour: Joi.number().integer().min(0).max(23),
      FromMinutes: Joi.number().integer().min(0).max(59),
      ToHour: Joi.number().integer().min(0).max(23),
      ToMinutes: Joi.number().integer().min(0).max(59),
    }),
    FRI: Joi.object().keys({
      FromHour: Joi.number().integer().min(0).max(23),
      FromMinutes: Joi.number().integer().min(0).max(59),
      ToHour: Joi.number().integer().min(0).max(23),
      ToMinutes: Joi.number().integer().min(0).max(59),
    }),
    SAT: Joi.object().keys({
      FromHour: Joi.number().integer().min(0).max(23),
      FromMinutes: Joi.number().integer().min(0).max(59),
      ToHour: Joi.number().integer().min(0).max(23),
      ToMinutes: Joi.number().integer().min(0).max(59),
    }),
    SUN: Joi.object().keys({
      FromHour: Joi.number().integer().min(0).max(23),
      FromMinutes: Joi.number().integer().min(0).max(59),
      ToHour: Joi.number().integer().min(0).max(23),
      ToMinutes: Joi.number().integer().min(0).max(59),
    }),
  }),
};

module.exports = {
  PreferenceDetails,
};
