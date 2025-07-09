import mongoose from 'mongoose';
import { toJSON, paginate } from './plugins/index.js';

const notificationSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error', 'event', 'payment', 'system'],
      default: 'info',
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    data: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map(),
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.plugin(toJSON);
notificationSchema.plugin(paginate);

// Index for efficient querying
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * @typedef Notification
 */
const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
