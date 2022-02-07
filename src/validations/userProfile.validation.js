const Joi = require('joi');
const { objectId } = require('./custom.validation');

const BasicUserDetails = {
  body: Joi.object().keys({
    gender: Joi.string().required().valid('male', 'female', 'other'),
    dob: Joi.date().required(),
    city: Joi.string(),
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

const updateBasicDetails = {
  body: Joi.object().keys({
    gender: Joi.string().required().valid('male', 'female', 'other'),
    dob: Joi.date(),
    city: Joi.string(),
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
    pincode: Joi.number().required().min(100000).max(999999),
  }),
};

const updateUserAddress = {
  body: Joi.object().keys({
    addressFristLine: Joi.string(),
    addressSecondLine: Joi.string(),
    state: Joi.string(),
    pincode: Joi.number().min(100000).max(999999),
  }),
};

const addMember = {
  body: Joi.object().keys({
    relation: Joi.string().required(),
    fullname: Joi.string().required(),
    gender: Joi.string().required().valid('male', 'female', 'other'),
    mobile: Joi.number().required().min(1000000000).max(9999999999),
    email: Joi.string().email(),
    dob: Joi.date().required(),
  }),
};

const updateMember = {
  body: Joi.object().keys({
    relation: Joi.string(),
    fullname: Joi.string(),
    gender: Joi.string().valid('male', 'female', 'other'),
    mobile: Joi.number().min(1000000000).max(9999999999),
    email: Joi.string().email(),
    dob: Joi.date(),
    memberId: Joi.string().custom(objectId).required(),
  }),
};

const deleteMember = {
  params: Joi.object().keys({
    memberId: Joi.string().custom(objectId).required(),
  }),
};

const notifications = {
  body: Joi.object().keys({
    appNotifications: Joi.boolean().required(),
    promotionalEmails: Joi.boolean().required(),
    offersAndDiscounts: Joi.boolean().required(),
  }),
};

module.exports = {
  BasicUserDetails,
  UserAddress,
  updateUserAddress,
  addMember,
  updateMember,
  updateBasicDetails,
  deleteMember,
  notifications,
};
