const Joi = require('joi');

const BasicDoctorDetails = {
  body: Joi.object().keys({
    gender: Joi.string().required().valid('M', 'F'),
    dob: Joi.date().required(),
    city: Joi.string().required(), //Add citites list here using valid or contains
    languages: Joi.string().valid("EN","HI"), //Add Languages supported here
  }),
};

const EducationDoctorDetails = {
  body: Joi.object().keys({
    mainstream: Joi.string().required(), //Add MainStream Validator
    speciality: Joi.array().required(),//Add Speciality Validator
    skills: Joi.array().required(), //Add Skills Validator
    experience: Joi.number().required(),
  }),
};



module.exports = {
  BasicDoctorDetails,
  EducationDoctorDetails,
};
