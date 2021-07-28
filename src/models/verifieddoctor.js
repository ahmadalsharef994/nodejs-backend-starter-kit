const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const VerifiedDoctorsSchema = mongoose.Schema(
  {
    verifieddocid: {
      type:String,
      required: true,
      index: true,
    },
    docid: {
      type: String,
      required: true,
      index: true,
    },
    verifiedby: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
VerifiedDoctorsSchema.plugin(toJSON);

/**
 * @typedef VerifiedDoctors
 */
const VerifiedDoctors = mongoose.model('VerifiedDoctors', VerifiedDoctorsSchema);

module.exports = VerifiedDoctors;
