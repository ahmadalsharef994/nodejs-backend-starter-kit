const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
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
    },
    AuthUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Auth,
      required: true,
    },
    Status: {
      type: String,
      required: true,
    },
    Type: {
      type: String,
      required: true,
    },
    StartTime: {
      type: Date,
      default: false,
    },
    EndTime: {
      type: Date,
      default: null,
    },
    UserDocument: {
      type: Array,
      required: true,
    },
    UserDescription: {
      type: String,
      required: true,
    },
    HealthIssue: {
      type: String,
      required: true,
    },
    LabTest: {
      type: Array,
      required: true,
    },
    DoctorAction: {
      type: String,
      required: true,
    },
    DoctorReason: {
      type: String,
      default: null,
    },
    UserAction: {
      type: String,
      required: true,
    },
    UserReason: {
      type: String,
      default: null,
    },
    isRescheduled: {
      type: Boolean,
      default: false,
    },
    DoctorRescheduleding: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
AppointmentSchema.plugin(toJSON);

/**
 * @typedef Appointment
 */
const Appointment = mongoose.model('Appointment', AppointmentSchema);

module.exports = Appointment;
