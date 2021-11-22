const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Appointment = require('./auth.model');

const FeedbackSchema = mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Appointment,
      required: true,
    },
    doctorRating: {
      type: Number,
      default: null,
    },
    userRating: {
      type: Number,
      default: null,
    },
    doctorDescription: {
      type: String,
      default: null,
    },
    userDescription: {
      type: String,
      default: null,
    },
    referedBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
FeedbackSchema.plugin(toJSON);
/**
 * @typedef Feedback
 */

const Feedback = mongoose.model('Feedback', FeedbackSchema);

module.exports = Feedback;
