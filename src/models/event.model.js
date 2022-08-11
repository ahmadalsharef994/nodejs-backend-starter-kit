const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const Auth = require('./auth.model');

const eventSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  link: {
    type: String,
  },
  image: {
    type: String,
  },
  createdBy: {
    type: String,
    required: true,
    default: 'admin',
    ref: Auth,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

eventSchema.plugin(toJSON);
eventSchema.plugin(paginate);

/**
 * @typedef Appointment
 */
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
