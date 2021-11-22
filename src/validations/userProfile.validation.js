const Joi = require('joi');

const BasicUserDetails = {
  body: Joi.object().keys({
    gender: Joi.string().required().valid('M', 'F', 'O'),
    dob: Joi.date().required(),
    languages: Joi.array().items(
      Joi.string().valid(
        'Assamese',
        'Bengali',
        'Bodo',
        'Dogri',
        'Gujarati',
        'Hindi',
        'Kannada',
        'Kashmiri',
        'Konkani',
        'Maithili',
        'Malayalam',
        'Manipuri',
        'Marathi',
        'Nepali',
        'Odia',
        'Punjabi',
        'Sanskrit',
        'Santali',
        'Sindhi',
        'Tamil',
        'Telugu',
        'Urdu',
        'English'
      )
    ), // Add Languages supported here
  }),
};

const UserAddress = {
  body: Joi.object().keys({
    addressFristLine: Joi.string().required(),
    addressSecondLine: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.number().required(),
  }),
};

const AddMember = {
  body: Joi.object().keys({
    relation: Joi.string().required(),
    fullname: Joi.string().required(),
    gender: Joi.string().required(),
    Dob: Joi.date().required(),
  }),
};

module.exports = {
  BasicUserDetails,
  UserAddress,
  AddMember,
};
