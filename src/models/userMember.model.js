const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const Auth = require('./auth.model');

const userMemberSchema = mongoose.Schema(
  {
    relation: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    Dob: {
      type: Date,
      required: true,
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
userMemberSchema.plugin(toJSON);

/**
 * @typedef UserMember
 */
const UserMember = mongoose.model('UserMember', userMemberSchema);

module.exports = UserMember;
