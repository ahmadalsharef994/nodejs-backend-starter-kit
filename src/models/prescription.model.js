const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Appointment = require('./auth.model');

const PrescriptionSchema = mongoose.Schema(
  {
    Appointment: {
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
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
PrescriptionSchema.plugin(toJSON);
/**
 * @typedef Prescription
 */

const Prescription = mongoose.model('Prescription', PrescriptionSchema);

module.exports = Prescription;
