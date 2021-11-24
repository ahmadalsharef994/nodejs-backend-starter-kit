/* eslint-disable no-param-reassign */
const { UserAddress, UserBasic, UserMember } = require('../models');

const fetchBasicDetails = async (AuthData) => {
  const DoctorBasicExist = await UserBasic.findOne({ auth: AuthData });
  return DoctorBasicExist;
};

const submitBasicDetails = async (BasicDetailBody, AuthData) => {
  const alreadyExist = await fetchBasicDetails(AuthData);
  if (!alreadyExist) {
    BasicDetailBody.auth = AuthData;
    const basicDetailDoc = await UserBasic.create(BasicDetailBody);
    return basicDetailDoc;
  }
  return false;
};

const updateBasicDetails = async (basicDetailsBody, AuthData) => {
  const DoctorAddressExist = await UserBasic.find({ auth: AuthData });
  if (DoctorAddressExist) {
    await UserBasic.findOneAndUpdate({ auth: AuthData }, { $set: { ...basicDetailsBody } }, { useFindAndModify: false });
    return true;
  }
  return false;
};

const addAddressDetails = async (addressDetailBody, AuthData) => {
  addressDetailBody.auth = AuthData;
  const addressDoc = await UserAddress.create(addressDetailBody);
  return addressDoc;
};

const fetchAddressDetails = async (AuthData) => {
  const DoctorAddressExist = await UserAddress.find({ auth: AuthData });
  return DoctorAddressExist;
};

const addMember = async (memberDetailBody, AuthData) => {
  const alreadyExist = await UserMember.find({ auth: AuthData });
  const totalMember = alreadyExist.length;
  if (totalMember > 4) {
    return false;
  }
  memberDetailBody.auth = AuthData;
  const basicDetailDoc = await UserMember.create(memberDetailBody);
  return basicDetailDoc;
};

const deleteMember = async (basicDetailsBody, AuthData) => {
  const DoctorAddressExist = await UserMember.find({ auth: AuthData, _id: basicDetailsBody.memberId });
  if (!DoctorAddressExist.length === 0) {
    await UserMember.findByIdAndDelete({ _id: basicDetailsBody.memberId });
    return true;
  }
  return false;
};

module.exports = {
  submitBasicDetails,
  fetchBasicDetails,
  addAddressDetails,
  fetchAddressDetails,
  updateBasicDetails,
  addMember,
  deleteMember,
};
