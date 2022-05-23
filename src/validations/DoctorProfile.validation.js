const Joi = require('joi');
const { objectId } = require('./custom.validation');

const BasicDoctorDetails = {
  body: Joi.object().keys({
    gender: Joi.string().required().valid('M', 'F', 'O'),
    dob: Joi.date().required(),
    pincode: Joi.number().required(),
    appointmentPrice: Joi.number().required(),
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
    registrationNo: Joi.string().required(),
  }),
};

const ExperienceDoctorDetails = {
  body: Joi.object().keys({
    mainstream: Joi.string().required(), // Add MainStream Validator
    specialization: Joi.array().items(
      Joi.string().valid(
        'Aerospace Medicine',
        'Anaesthesia',
        'Anaesthesiology',
        'Bariatric Surgery',
        'Cardiology - Interventional',
        'Cardiology - Non Interventional',
        'Cardiothoracic And Vascular Surgery',
        'Centre For Spinal Diseases',
        'Clinical Haematology And BMT',
        'Corneal Transplant',
        'Community medicine',
        'Critical Care Medicine',
        'Dermatology And Cosmetology',
        'Dermatology, Venereology & Leprosy',
        'Ear Nose Throat Head And Neck(ENT)',
        'Emergency Medicine',
        'Endocrinology',
        'Family Medicine',
        'Forensic Medicine',
        'General Medicine',
        'General Surgery',
        'Geriatrics',
        'Immunohematology and Blood transfusion',
        'Infectious Diseases',
        'Internal Medicine',
        'In-Vitro Fertilisation (IVF)',
        'Laboratory Medicine',
        'Liver Transplant & Hepatic Surgery',
        'Marine Medicine',
        'Maxillofacial Surgery',
        'Medical Gastroenterology',
        'Medical Genetics',
        'Medical Oncology & Clinical Haematology',
        'Medical Oncology',
        'Microbiology',
        'Minimally Invasive Gynaecology',
        'Neonatology',
        'Nephrology',
        'Neuro Modulation',
        'Nutrition & Dietetics',
        'Neurology',
        'Neurosurgery',
        'Obstetrics And Gynaecology',
        'Ophthalmology',
        'Orthopaedics',
        'Otorhinolaryngology',
        'Pain Management',
        'Paediatric Surgery',
        'Palliative Medicine',
        'Pathology',
        'Pharmacology',
        'Physiotherapy',
        'Plastic Surgery',
        'Psychiatry',
        'Pulmonology',
        'Pulmonary Medicine',
        'Radiodiagnosis',
        'Radiotherapy',
        'Renal Transplant',
        'Reproductive Medicine & IVF',
        'Respiratory Medicine',
        'Rheumatology',
        'Robotic Surgery',
        'Surgical Gastroenterology',
        'Surgical Oncology',
        'Traumatology & Surgery',
        'Urology',
        'Vascular and endovascular surgery',
        'General Physician',
        'Others'
      )
    ), // Add Speciality Validator
    skills: Joi.array().required(), // Add Skills Validator
    experience: Joi.number().required(),
  }),
};

const addConsultationfee = {
  body: Joi.object().keys({
    Consultationcharges: Joi.number().required(),
    MedzgoCharge: Joi.number().required(),
    NetFeeRecieved: Joi.number().required(),
  }),
};

const notifications = {
  body: Joi.object().keys({
    appNotifications: Joi.boolean().required(),
    promotionalEmails: Joi.boolean().required(),
    offersAndDiscounts: Joi.boolean().required(),
  }),
};
const timings = {
  body: Joi.object().keys({
    timing: Joi.array().required(),
    clinicId: Joi.string().custom(objectId),
  }),
};

const ClinicDoctorDetails = {
  body: Joi.object().keys({
    clinicName: Joi.string().required(),
    AddressFirstline: Joi.string().required(),
    AddressSecondline: Joi.string().required(),
    clinicTelephone: Joi.number().required(),
    pincode: Joi.number().required(),
    timing: Joi.array(),
  }),
};

const PayoutsDoctorDetails = {
  body: Joi.object().keys({
    BankAccNo: Joi.string().required(),
    IFSC: Joi.string().required(),
    AccountName: Joi.string().required(),
    AadharCardNo: Joi.string().required(),
    PanCardNo: Joi.string().required(),
  }),
};
const updateDetails = {
  body: Joi.object().keys({
    about: Joi.string().required().max(150),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.number().required(),
    country: Joi.string().required(),
    experience: Joi.number().required(),
  }),
};
const EducationExperience = {
  body: Joi.object().keys({
    education: Joi.object().keys({
      registrationNo: Joi.number().required(),
      yearofRegistration: Joi.number().required(),
      stateMedicalCouncil: Joi.string().required(),
    }),
    experience: Joi.object().keys({
      mainstream: Joi.string().required(),
      specialization: Joi.array().required(),
      skills: Joi.array().required(),
      experience: Joi.number().required(),
    }),
  }),
};
const updateAppointmentPrice = {
  body: Joi.object().keys({
    appointmentPrice: Joi.number().required(),
  }),
};

module.exports = {
  BasicDoctorDetails,
  EducationDoctorDetails,
  ExperienceDoctorDetails,
  ClinicDoctorDetails,
  PayoutsDoctorDetails,
  addConsultationfee,
  notifications,
  timings,
  updateDetails,
  EducationExperience,
  updateAppointmentPrice,
};
