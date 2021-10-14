const Joi = require('joi');

const BasicDoctorDetails = {
  body: Joi.object().keys({
    gender: Joi.string().required().valid('M', 'F', 'O'),
    dob: Joi.date().required(),
    pin: Joi.number().required(),
    state: Joi.string()
      .required()
      .valid(
        'Andhra Pradesh',
        'Arunachal Pradesh',
        'Assam',
        'Bihar',
        'Chhattisgarh',
        'Goa',
        'Gujarat',
        'Haryana',
        'Himachal Pradesh',
        'Jammu and Kashmir',
        'Jharkhand',
        'Karnataka',
        'Kerala',
        'Madhya Pradesh',
        'Maharashtra',
        'Manipur',
        'Meghalaya',
        'Mizoram',
        'Nagaland',
        'Odisha',
        'Punjab',
        'Rajasthan',
        'Sikkim',
        'Tamil Nadu',
        'Telangana',
        'Tripura',
        'Uttarakhand',
        'Uttar Pradesh',
        'West Bengal',
        'Andaman and Nicobar Islands',
        'Chandigarh',
        'Dadra and Nagar Haveli',
        'Daman and Diu',
        'Delhi',
        'Lakshadweep',
        'Puducherry'
      ),
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

const EducationDoctorDetails = {
  body: Joi.object().keys({
    yearofRegistration: Joi.number().required(),
    stateMedicalCouncil: Joi.string().valid(
      'Arunachal Pradesh Medical Council',
      'Assam Medical Council',
      'Bareilly Medical Council',
      'Bhopal Medical Council',
      'Bihar Medical Council',
      'Bombay Medical Council',
      'Chandigarh Medical Council',
      'Chattisgarh Medical Council',
      'Delhi Medical Council',
      'Dental Council of India',
      'General Medical Council',
      'Goa Medical Council',
      'Gujarat Medical Council',
      'Haryana Medical Councils',
      'Himachal Pradesh Medical Council',
      'Hyderabad Medical Council',
      'Jammu & Kashmir Medical Council',
      'Jharkhand Medical Council',
      'Karnataka Medical Council',
      'Kerala Medical Council',
      'Madhya Pradesh Medical Council',
      'Madras Medical Council',
      'Mahakoshal Medical Council',
      'Maharashtra Medical Council',
      'Manipur Medical Council',
      'Medical Council of India',
      'Medical Council of Tanganyika',
      'Mizoram Medical Council',
      'Mysore Medical Council',
      'Nagaland Medical Council',
      'Orissa Council of Medical Registration',
      'Pondicherry Medical Council',
      'Punjab Medical Council',
      'Rajasthan Medical Council',
      'Sikkim Medical Council',
      'Tamil Nadu Medical Council',
      'Telangana State Medical Council',
      'Travancore Cochin Medical Council',
      'Tripura State Medical Council',
      'Uttar Pradesh Medical Council',
      'Uttarakhand Medical Council',
      'Vidharba Medical Council',
      'West Bengal Medical Council'
    ),
    registrationNo: Joi.number().required(),
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
    pin: Joi.number().required(),
  }),
};

module.exports = {
  BasicDoctorDetails,
  EducationDoctorDetails,
  ExperienceDoctorDetails,
  ClinicDoctorDetails,
};
