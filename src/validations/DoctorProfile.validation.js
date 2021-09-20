const Joi = require('joi');

const BasicDoctorDetails = {
  body: Joi.object().keys({
    gender: Joi.string().required().valid('M', 'F'),
    dob: Joi.date().required(),
    pin:Joi.number().required(),
    state: Joi.string().required(), // Add citites list here using valid or contains
    languages: Joi.string().valid('EN', 'HI'), // Add Languages supported here
  }),
};

const EducationDoctorDetails = {
  body: Joi.object().keys({
    yearofRegistration: Joi.number().required(),
    stateMedicalCouncil: Joi.string().required(),
    registrationNo: Joi.number().required() 

  }),
};

const ExperienceDoctorDetails = {
  body: Joi.object().keys({
    mainstream: Joi.string().required(), // Add MainStream Validator
    specialization: Joi.array().required(), // Add Speciality Validator
    skills: Joi.array().required(), // Add Skills Validator
    experience: Joi.number().required(),
  }),
};

const ClinicDoctorDetails = {
  body: Joi.object().keys({
    clinicName: Joi.string().required(), // Add MainStream Validator
    AddressFirstline: Joi.string().required(), // Add Speciality Validator
    AddressSecondline: Joi.string().required(), // Add Skills Validator
    clinicTelephone: Joi.number().required(),
    pin: Joi.number().required()
    
  }),
};


module.exports = {
  BasicDoctorDetails,
  EducationDoctorDetails,
  ExperienceDoctorDetails,
  ClinicDoctorDetails
};
