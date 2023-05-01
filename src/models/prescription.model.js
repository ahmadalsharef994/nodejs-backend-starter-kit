const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const Appointment = require('./auth.model');

const PrescriptionSchema = mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    userAuth: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Appointment,
      required: true,
    },
    Appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Appointment,
      required: true,
    },
    doctorAuth: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Appointment,
      required: true,
    },
    PrescriptionNo: {
      type: Number,
      required: true,
      default: 1,
    },
    Medicines: [
      {
        name: { type: String },
        dosage: { type: String },
        days: { type: Number },
        dosageInstructions: { type: String },
      },
    ],
    LabTest: {
      type: String,
      default: null,
    },
    OtherInstructions: {
      type: String,
      default: null,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    prescriptionUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
PrescriptionSchema.plugin(toJSON);
PrescriptionSchema.plugin(paginate);

/**
 * @typedef Prescription
 */

const Prescription = mongoose.model('Prescription', PrescriptionSchema);

module.exports = Prescription;
