const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');

const docSchema = mongoose.Schema({
  resume: {
    type: String,
    default: null,
  },
  esign: {
    type: String,
    default: null,
  },
  ifsc: {
    type: String,
    default: null,
  },
  medicalDegree: {
    type: String,
    default: null,
  },
  medicalRegistration: {
    type: String,
    default: null,
  },
  aadharCardDoc: {
    type: String,
    default: null,
  },
  pancardDoc: {
    type: String,
    default: null,
  },
  isRestricted: {
    type: Boolean,
    default: false,
  },
  auth: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Auth,
  },
});

// add plugin that converts mongoose to json
docSchema.plugin(toJSON);

/**
 * @typedef doc
 */
const Document = mongoose.model('Document', docSchema);

module.exports = Document;
