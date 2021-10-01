const Joi = require('joi');

const documentUrl = {
  params: Joi.object().keys({
    doctype: Joi.string().valid(
      'resume',
      'esign',
      'ifsc',
      'medicalDegree',
      'medicalRegistration',
      'aadharCardDoc',
      'pancardDoc'
    ),
  }),
};

module.exports = {
  documentUrl,
};
