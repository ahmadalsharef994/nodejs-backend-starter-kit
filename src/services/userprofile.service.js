const { UserBasic } = require('../models');
const calculateAge = require('../utils/calculateAge');

const fetchBasicDetails = async (AuthData) => {
  const userBasicDetails = await UserBasic.findOne({ auth: AuthData });
  return userBasicDetails;
};
const userIdgenerator = () => {
  const number = Math.round((Date.now() * Math.random() + (Math.random() + 1000)) / 100);
  return number;
};
const submitBasicDetails = async (BasicDetailBody, AuthData) => {
  // eslint-disable-next-line no-param-reassign
  BasicDetailBody.auth = AuthData;
  // eslint-disable-next-line no-param-reassign
  BasicDetailBody.userid = `PT${userIdgenerator()}`;
  const basicDetailDoc = await UserBasic.create(BasicDetailBody);
  return basicDetailDoc;
};

const updateBasicDetails = async (basicDetailsBody, AuthData) => {
  const userBasicExist = await fetchBasicDetails(AuthData);
  if (userBasicExist) {
    const updatedBasicDetails = await UserBasic.findOneAndUpdate(
      { auth: AuthData },
      { $set: { ...basicDetailsBody } },
      { new: true }
    );
    return updatedBasicDetails;
  }
  return false;
};

// const addAddressDetails = async (addressDetailBody, AuthData) => {
//   const alreadyExist = await UserAddress.findOne({ auth: AuthData });
//   if (!alreadyExist) {
//     // eslint-disable-next-line no-param-reassign
//     addressDetailBody.auth = AuthData;
//     const addressDoc = await UserAddress.create(addressDetailBody);
//     return addressDoc;
//   }
//   return false;
// };

// const updateAddress = async (addressDetailsBody, AuthData) => {
//   const userAddressExist = await UserAddress.findOne({ auth: AuthData });
//   if (userAddressExist) {
//     const updatedAddressDoc = await UserAddress.findOneAndUpdate(
//       { auth: AuthData },
//       { $set: { ...addressDetailsBody } },
//       { new: true }
//     );
//     return updatedAddressDoc;
//   }
//   return false;
// };

// const fetchAddressDetails = async (AuthData) => {
//   const userAddressExist = await UserAddress.findOne({ auth: AuthData });
//   if (userAddressExist) {
//     return userAddressExist;
//   }
//   return false;
// };

// const fetchAllMembers = async (AuthData) => {
//   const members = await UserMember.find({ auth: AuthData });
//   if (members.length === 0) {
//     return false;
//   }
//   return members;
// };

// const addMember = async (memberDetailsBody, AuthData) => {
//   const allMembers = await fetchAllMembers(AuthData);
//   const totalMember = await allMembers.length;
//   if (totalMember >= 4) {
//     return false;
//   }

//   // check for duplicate member numbers
//   /*
//   if (allMembers) {
//     const numberExist = await allMembers.find((member) => member.mobile === memberDetailsBody.mobile);
//     if (numberExist) {
//       throw new ApiError(httpStatus.BAD_REQUEST, 'Number already assigned to a family member');
//     }
//   }
//   */

//   // eslint-disable-next-line no-param-reassign
//   memberDetailsBody.auth = AuthData;
//   const memberDetailsDoc = await UserMember.create(memberDetailsBody);
//   return memberDetailsDoc;
// };

// const updateMember = async (memberDetailsBody, AuthData) => {
//   const member = await UserMember.findOneAndUpdate(
//     { _id: memberDetailsBody.memberId, auth: AuthData },
//     { $set: { ...memberDetailsBody } },
//     { new: true }
//   );
//   if (member) {
//     return member;
//   }
//   return false;
// };

// const deleteMember = async (memberId, AuthData) => {
//   const memberExist = await UserMember.findOne({ auth: AuthData, _id: memberId });
//   if (memberExist) {
//     await UserMember.findByIdAndDelete({ _id: memberId });
//     return true;
//   }
//   return false;
// };

const getUserProfile = async (AuthData) => {
  const fullName = AuthData.fullname;
  const basicDetails = await UserBasic.findOne({ auth: AuthData.id });
  const age = calculateAge(basicDetails.dob);
  let gender = await basicDetails.gender;
  gender = gender[0].toUpperCase() + gender.slice(1);
  const pincode = await basicDetails.pincode;
  // const address = await UserAddress.findOne({ auth: AuthData });
  return { fullName, age, gender, avatar: basicDetails.avatar, pincode };
};

// const notificationSettings = async (notifications, auth) => {
//   const notificationDoc = await Notification.findOneAndUpdate(
//     { auth },
//     { $set: { ...notifications, auth } },
//     { upsert: true, new: true }
//   );
//   if (notificationDoc) {
//     return { message: 'Notification Options Updated!', notificationDoc };
//   }
//   return false;
// };
const updateProfilePic = async (Avatar, auth) => {
  await UserBasic.updateOne({ auth }, { $set: { avatar: Avatar } });
  const { avatar } = await UserBasic.findOne({ auth });
  return avatar;
};
module.exports = {
  submitBasicDetails,
  fetchBasicDetails,
  updateBasicDetails,
  // addAddressDetails,
  // fetchAddressDetails,
  // updateAddress,
  // addMember,
  // updateMember,
  // deleteMember,
  // fetchAllMembers,
  getUserProfile,
  // notificationSettings,
  updateProfilePic,
};
