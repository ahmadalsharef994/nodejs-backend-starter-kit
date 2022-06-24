const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const Auth = require('./auth.model');

const AppointmentSchema = mongoose.Schema(
  {
    AuthDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Auth,
      required: true,
    },
    docid: {
      type: Number,
      required: true,
      index: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    doctorSpeciality: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      default: 'NOT PAID',
      required: true,
    },
    paymentType: {
      type: String,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientMobile: {
      type: Number,
      required: true,
    },
    patientMail: {
      type: String,
      default: null,
    },
    slotId: {
      type: String,
      required: true,
    },
    AuthUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Auth,
      required: true,
    },
    Gender: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    Status: {
      type: String,
    },
    Type: {
      type: String,
    },
    Date: {
      type: String,
      required: true,
    },
    StartTime: {
      type: Date,
      required: true,
      index: true,
    },
    EndTime: {
      type: Date,
      required: true,
    },
    UserDocument: {
      type: Array,
      default: null,
    },
    UserDescription: {
      type: String,
    },
    HealthIssue: {
      type: String,
      required: true,
    },
    LabTest: {
      type: Array,
      default: null,
    },
    DoctorAction: {
      type: String,
      default: null,
    },
    UserAction: {
      type: String,
      default: null,
    },
    UserReason: {
      type: String,
      default: null,
    },
    isRescheduled: {
      type: Boolean,
      default: false,
    },
    RescheduledReason: {
      type: String,
      default: null,
    },
    DoctorRescheduled: {
      type: String,
      default: null,
    },
    orderId: {
      type: String,
      required: true,
    },
    chatHistory: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
AppointmentSchema.plugin(toJSON);
AppointmentSchema.plugin(paginate);

/**
 * @typedef Appointment
 */
const Appointment = mongoose.model('Appointment', AppointmentSchema);

module.exports = Appointment;
