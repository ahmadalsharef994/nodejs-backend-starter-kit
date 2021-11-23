const Joi = require('joi');

const preferenceDetails = {
  body: Joi.object().keys({
    MON: Joi.array().items(
      Joi.object().keys({
        FromHour: Joi.number().integer().min(0).max(23),
        FromMinutes: Joi.number().integer().min(0).max(59),
        ToHour: Joi.number().integer().min(0).max(23),
        ToMinutes: Joi.number().integer().min(0).max(59),
      })
    ),
    TUE: Joi.array().items(
      Joi.object().keys({
        FromHour: Joi.number().integer().min(0).max(23),
        FromMinutes: Joi.number().integer().min(0).max(59),
        ToHour: Joi.number().integer().min(0).max(23),
        ToMinutes: Joi.number().integer().min(0).max(59),
      })
    ),
    WED: Joi.array().items(
      Joi.object().keys({
        FromHour: Joi.number().integer().min(0).max(23),
        FromMinutes: Joi.number().integer().min(0).max(59),
        ToHour: Joi.number().integer().min(0).max(23),
        ToMinutes: Joi.number().integer().min(0).max(59),
      })
    ),
    THU: Joi.array().items(
      Joi.object().keys({
        FromHour: Joi.number().integer().min(0).max(23),
        FromMinutes: Joi.number().integer().min(0).max(59),
        ToHour: Joi.number().integer().min(0).max(23),
        ToMinutes: Joi.number().integer().min(0).max(59),
      })
    ),
    FRI: Joi.array().items(
      Joi.object().keys({
        FromHour: Joi.number().integer().min(0).max(23),
        FromMinutes: Joi.number().integer().min(0).max(59),
        ToHour: Joi.number().integer().min(0).max(23),
        ToMinutes: Joi.number().integer().min(0).max(59),
      })
    ),
    SAT: Joi.array().items(
      Joi.object().keys({
        FromHour: Joi.number().integer().min(0).max(23),
        FromMinutes: Joi.number().integer().min(0).max(59),
        ToHour: Joi.number().integer().min(0).max(23),
        ToMinutes: Joi.number().integer().min(0).max(59),
      })
    ),
    SUN: Joi.array().items(
      Joi.object().keys({
        FromHour: Joi.number().integer().min(0).max(23),
        FromMinutes: Joi.number().integer().min(0).max(59),
        ToHour: Joi.number().integer().min(0).max(23),
        ToMinutes: Joi.number().integer().min(0).max(59),
      })
    ),
  }),
};

const getAppointmentSlots = {
  body: Joi.object().keys({
    docId: Joi.number().integer().required().min(10000000).max(99999999),
  }),
};

module.exports = {
  preferenceDetails,
  getAppointmentSlots,
};
