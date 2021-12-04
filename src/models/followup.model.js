const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Appointment = require('./auth.model');

const FollowupSchema = mongoose.Schema(
  {
    Appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Appointment,
      required: true,
    },
    docid: {
      type: String,
      required: true,
    },
    slotId: {
      type: String,
      required: true,
    },
    StartTime: {
      type: Date,
      required: true,
    },
    EndTime: {
      type: Date,
      required: true,
    },
    FollowupNo: {
      type: Number,
      required: true,
    },
    FollowupDocs: {
      type: Array,
      default: null,
    },
    Status: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
FollowupSchema.plugin(toJSON);
/**
 * @typedef Followup
 */

const Followup = mongoose.model('Followup', FollowupSchema);

module.exports = Followup;
