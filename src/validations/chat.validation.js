const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getMessages = {
  params: Joi.object().keys({
    appointmentId: Joi.string().custom(objectId).required(),
  }),
};

// const sendMessage = {
//   params: Joi.object().keys({
//     appointmentId: Joi.string().custom(objectId).required(),
//   }),
//   body: Joi.object().keys({
//     text: Joi.string().required(),
//     attachment: Joi.string(),
//   }),
// };

module.exports = {
  getMessages,
  // sendMessage,
};
