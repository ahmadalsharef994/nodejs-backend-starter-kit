/* eslint-disable no-param-reassign */
const { UserAddress, UserBasic, UserMember } = require('../models');

const fetchbasicdetails = async (AuthData) => {
  const DoctorBasicExist = await UserBasic.findOne({ auth: AuthData });
  return DoctorBasicExist;
};

const submitbasicdetails = async (BasicDetailBody, AuthData) => {
  const alreadyExist = await fetchbasicdetails(AuthData);
  if (!alreadyExist) {
    BasicDetailBody.auth = AuthData;
    const basicDetailDoc = await UserBasic.create(BasicDetailBody);
    return basicDetailDoc;
  }
  return false;
};

const addAddressdetails = async (addressDetailBody, AuthData) => {
  addressDetailBody.auth = AuthData;
  const addressDoc = await UserAddress.create(addressDetailBody);
  return addressDoc;
};

const fetchaddressdetails = async (AuthData) => {
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

module.exports = {
  submitbasicdetails,
  fetchbasicdetails,
  addAddressdetails,
  fetchaddressdetails,
  addMember,
};
