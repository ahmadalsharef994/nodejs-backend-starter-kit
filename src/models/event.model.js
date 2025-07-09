import mongoose from 'mongoose';
import { toJSON, paginate } from './plugins/index.js';

const eventSchema = mongoose.Schema(
  {
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
      default: 'Online',
    },
    link: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxParticipants: {
      type: Number,
      default: null,
    },
    participants: [{
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    }],
    category: {
      type: String,
      enum: ['webinar', 'workshop', 'meeting', 'conference', 'other'],
      default: 'other',
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.plugin(toJSON);
eventSchema.plugin(paginate);

/**
 * @typedef Event
 */
const Event = mongoose.model('Event', eventSchema);

export default Event;
