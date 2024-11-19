const Joi = require('joi');
const { objectId } = require('./custom.validation');

const BasicDoctorDetails = {
  body: Joi.object().keys({
    gender: Joi.string().required().valid('M', 'F', 'O'),
    dob: Joi.date().required(),
    pincode: Joi.number().required(),
    appointmentPrice: Joi.number().default(600),
    state: Joi.string()
      .required()
      .valid(
        'Albania',
        'Andorra',
        'Austria',
        'Belarus',
        'Belgium',
        'Bosnia and Herzegovina',
        'Bulgaria',
        'Croatia',
        'Cyprus',
        'Czech Republic',
        'Denmark',
        'Estonia',
        'Finland',
        'France',
        'Germany',
        'Greece',
        'Hungary',
        'Iceland',
        'Ireland',
        'Italy',
        'Kosovo',
        'Latvia',
        'Liechtenstein',
        'Lithuania',
        'Luxembourg',
        'Malta',
        'Moldova',
        'Monaco',
        'Montenegro',
        'Netherlands',
        'North Macedonia',
        'Norway',
        'Poland',
        'Portugal',
        'Romania',
        'Russia',
        'San Marino',
        'Serbia',
        'Slovakia',
        'Slovenia',
        'Spain',
        'Sweden',
        'Switzerland',
        'Ukraine',
        'United Kingdom',
        'Vatican City'
      ),
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

const EducationDoctorDetails = {
  body: Joi.object().keys({
    yearofRegistration: Joi.number().required(),
    stateMedicalCouncil: Joi.string().valid(
      'Austria Medical University of Graz',
      'Belgium University of Antwerp',
      'Bulgaria Medical University of Sofia',
      'Croatia University of Zagreb',
      'Cyprus University of Cyprus',
      'Czech Republic Charles University in Prague',
      'Denmark University of Copenhagen',
      'Estonia University of Tartu',
      'Finland University of Helsinki',
      'France University of Paris',
      'Germany University of Heidelberg',
      'Greece University of Athens',
      'Hungary Semmelweis University',
      'Iceland University of Iceland',
      'Ireland Trinity College Dublin',
      'Italy University of Bologna',
      'Latvia University of Latvia',
      'Lithuania Vilnius University',
      'Luxembourg University of Luxembourg',
      'Malta University of Malta',
      'Netherlands University of Amsterdam',
      'Norway University of Oslo',
      'Poland Jagiellonian University in Krakow',
      'Portugal University of Coimbra',
      'Romania Carol Davila University of Medicine and Pharmacy',
      'Slovakia Comenius University in Bratislava',
      'Slovenia University of Ljubljana',
      'Spain University of Barcelona',
      'Sweden Karolinska Institute',
      'Switzerland University of Zurich',
      'United Kingdom University of Oxford'
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

// const addConsultationfee = {
//   body: Joi.object().keys({
//     Consultationcharges: Joi.number().required(),
//     wellpathCharge: Joi.number().required(),
//     NetFeeRecieved: Joi.number().required(),
//   }),
// };

const notificationSettings = {
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
// const updateDetails = {
//   body: Joi.object().keys({
//     about: Joi.string().required().max(150),
//     address: Joi.string().required(),
//     city: Joi.string().required(),
//     state: Joi.string().required(),
//     pincode: Joi.number().required(),
//     country: Joi.string().required(),
//     experience: Joi.number().required(),
//   }),
// };
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
    appointmentPrice: Joi.number().default(600),
  }),
};
const doctorQueries = {
  body: Joi.object().keys({
    message: Joi.string().required(),
  }),
};

module.exports = {
  BasicDoctorDetails,
  EducationDoctorDetails,
  ExperienceDoctorDetails,
  ClinicDoctorDetails,
  PayoutsDoctorDetails,
  // addConsultationfee,
  notificationSettings,
  timings,
  // updateDetails,
  EducationExperience,
  updateAppointmentPrice,
  doctorQueries,
};
