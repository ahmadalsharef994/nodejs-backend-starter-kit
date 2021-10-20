const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Appointment = require('./auth.model');

const FeedbackSchema = mongoose.Schema(
  {
    Appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Appointment,
      required: true,
    },
    DoctorRating: {
      type: Number,
      required: true,
    },
    UserRating: {
      type: Number,
      required: true,
    },
    DoctorDescription: {
      type: String,
      required: true,
    },
    UserDescription: {
      type: String,
      required: true,
    },
    referedBy: {
      type: String,
      required: true,
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
