const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');

const DoctorPayoutSchema = mongoose.Schema(
  {
    BankAccNo: {
      type: String,
      required: true,
    },
    IFSC: {
      type: String,
      required: true,
    },
    AccountName: {
      type: String,
      required: true,
    },
    AadharCardNo: {
      type: String,
      required: true,
    },
    PanCardNo: {
      type: String,
      required: true,
    },
    isPayoutVerified: {
      type: Boolean,
      default: false,
    },
    auth: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Auth,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
DoctorPayoutSchema.plugin(toJSON);

/**
 * @typedef DoctorPayout
 */
const DoctorPayout = mongoose.model('DoctorPayout', DoctorPayoutSchema);

module.exports = DoctorPayout;
