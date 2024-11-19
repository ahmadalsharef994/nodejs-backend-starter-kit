const Joi = require('joi');
const { objectId } = require('./custom.validation');

const submitBasicDetails = {
  body: Joi.object().keys({
    gender: Joi.string().required().valid('male', 'female', 'other'),
    dob: Joi.date().required(),
    city: Joi.string(),
    maritalstatus: Joi.string(),
    height: Joi.string().required(),
    weight: Joi.string().required(),
    languages: Joi.array().items(
      Joi.string().valid(
        'Albanian',
        'Armenian',
        'Azerbaijani',
        'Belarusian',
        'Bosnian',
        'Bulgarian',
        'Catalan',
        'Croatian',
        'Czech',
        'Danish',
        'Dutch',
        'English',
        'Estonian',
        'Finnish',
        'French',
        'Georgian',
        'German',
        'Greek',
        'Hungarian',
        'Icelandic',
        'Irish',
        'Italian',
        'Kazakh',
        'Latvian',
        'Liechtensteinish',
        'Lithuanian',
        'Luxembourgish',
        'Macedonian',
        'Maltese',
        'Moldovan',
        'Montenegrin',
        'Norwegian',
        'Polish',
        'Portuguese',
        'Romanian',
        'Russian',
        'Serbian',
        'Slovak',
        'Slovenian',
        'Spanish',
        'Swedish',
        'Turkish',
        'Ukrainian'
      )
    ), // Add Languages supported here
  }),
};

const updateBasicDetails = {
  body: Joi.object().keys({
    gender: Joi.string().required().valid('male', 'female', 'other'),
    dob: Joi.date(),
    city: Joi.string(),
    maritalstatus: Joi.string(),
    height: Joi.string().required(),
    weight: Joi.string().required(),
    languages: Joi.array().items(
      Joi.string().valid(
        'Albanian',
        'Armenian',
        'Azerbaijani',
        'Belarusian',
        'Bosnian',
        'Bulgarian',
        'Catalan',
        'Croatian',
        'Czech',
        'Danish',
        'Dutch',
        'English',
        'Estonian',
        'Finnish',
        'French',
        'Georgian',
        'German',
        'Greek',
        'Hungarian',
        'Icelandic',
        'Irish',
        'Italian',
        'Kazakh',
        'Latvian',
        'Liechtensteinish',
        'Lithuanian',
        'Luxembourgish',
        'Macedonian',
        'Maltese',
        'Moldovan',
        'Montenegrin',
        'Norwegian',
        'Polish',
        'Portuguese',
        'Romanian',
        'Russian',
        'Serbian',
        'Slovak',
        'Slovenian',
        'Spanish',
        'Swedish',
        'Turkish',
        'Ukrainian'
      )
    ), // Add Languages supported here
  }),
};

const addAddress = {
  body: Joi.object().keys({
    addressFristLine: Joi.string().required(),
    addressSecondLine: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.number().required().min(100000).max(999999),
  }),
};

const updateAddress = {
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
    mobile: Joi.number().required().min(100000000).max(9999999999),
    email: Joi.string().email(),
    dob: Joi.date().required(),
  }),
};

const updateMember = {
  body: Joi.object().keys({
    relation: Joi.string(),
    fullname: Joi.string(),
    gender: Joi.string().valid('male', 'female', 'other'),
    mobile: Joi.number().min(100000000).max(9999999999),
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

const updateNotificationSettings = {
  body: Joi.object().keys({
    appNotifications: Joi.boolean().required(),
    promotionalEmails: Joi.boolean().required(),
    offersAndDiscounts: Joi.boolean().required(),
  }),
};

module.exports = {
  submitBasicDetails,
  addAddress,
  updateAddress,
  addMember,
  updateMember,
  updateBasicDetails,
  deleteMember,
  updateNotificationSettings,
};
