const Joi = require('joi');

const cartAmout = {
  body: Joi.object().keys({
    amount: Joi.string().required(),
  }),
};

module.exports = {
  cartAmout,
};
