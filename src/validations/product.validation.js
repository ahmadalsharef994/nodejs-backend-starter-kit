const Joi = require('joi');
const { objectId } = require('./custom.validation');

const addProductReview = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    score: Joi.number().required(),
    description: Joi.string().required(),
  }),
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

module.exports = {
  addProductReview,
};
