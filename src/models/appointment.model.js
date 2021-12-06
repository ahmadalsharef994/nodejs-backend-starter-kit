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
      index: true,
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
    Status: {
      type: String, // SCHEDULED, CANCELLED, FOLLOWED-UP, REFERRED
      required: true,
    },
    Type: {
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
      required: true,
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
    DoctorReason: {
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
    DoctorRescheduled: {
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
