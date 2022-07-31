const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const userprofileService = require('../services/userprofile.service');
const { authService, appointmentService } = require('../services');

const getStats = catchAsync(async (req, res) => {
  const feedbacks = await appointmentService.getUserFeedbacks(req.query.id);

  const RATING = (
    feedbacks.reduce((doctorRatingsSum, feedback) => {
      return doctorRatingsSum + feedback.doctorRating;
    }, 0) / feedbacks.length
  ).toFixed(1);

  res.status(httpStatus.OK).json({
    message: 'success',
    data: RATING,
  });
});

const showUserProfile = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const result = await userprofileService.getUserProfile(AuthData);
  if (result) {
    res.status(httpStatus.OK).json({ message: "User's Profile details", data: result });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Cannot Get Profile Details' });
  }
});

const submitBasicDetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const resultData = await userprofileService.submitBasicDetails(req.body, AuthData);
  if (resultData) {
    res.status(httpStatus.OK).json({ message: 'Basic details submmitted for User', data: resultData });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Basic Details already submitted' });
  }
});

const fetchBasicDetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const basicdata = await userprofileService.fetchBasicDetails(AuthData);
  if (!basicdata) {
    res.status(httpStatus.NOT_FOUND).json({ message: 'Your basic details is not added' });
  } else {
    res.status(httpStatus.OK).json({ message: 'Success', data: basicdata });
  }
});

const updateBasicDetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const updatedBasicDetails = await userprofileService.updateBasicDetails(req.body, AuthData);
  if (updatedBasicDetails) {
    res.status(httpStatus.OK).json({ message: 'Basic details updated Successfully', data: updatedBasicDetails });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'You have not added your basic details' });
  }
});

const fetchAddressDetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const addressData = await userprofileService.fetchAddressDetails(AuthData);
  if (!addressData) {
    res.status(httpStatus.NOT_FOUND).json({ message: 'Address details not added' });
  } else {
    res.status(httpStatus.OK).json({ message: 'Success', data: addressData });
  }
});

const addAddressDetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const addressDetails = await userprofileService.addAddressDetails(req.body, AuthData);
  if (addressDetails) {
    res.status(httpStatus.OK).json({ message: 'Address details added ', data: addressDetails });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Address details already submitted' });
  }
});

const updateAddressDetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const addressDetails = await userprofileService.updateAddress(req.body, AuthData);
  if (addressDetails) {
    res.status(httpStatus.OK).json({ message: 'Address details updated Successfully', data: addressDetails });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'You have not added your basic details' });
  }
});

const addMember = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const memberDetails = await userprofileService.addMember(req.body, AuthData);
  if (memberDetails) {
    res.status(httpStatus.OK).json({ message: 'New Family Member added ', data: memberDetails });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'You can only add 4 family Members' });
  }
});

const updateMember = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const updatedMemberDetails = await userprofileService.updateMember(req.body, AuthData);
  if (updatedMemberDetails) {
    res.status(httpStatus.OK).json({ message: 'Family Member details updated Successfully', data: updatedMemberDetails });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Update Family member details failed. Check memberId' });
  }
});

const deleteMember = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const deletedMember = await userprofileService.deleteMember(req.params.memberId, AuthData);
  if (deletedMember) {
    res.status(httpStatus.OK).json({ message: 'Member Deleted Successfully' });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: "Family Member Doesn't Exist. Check memberId" });
  }
});

const getAllMembers = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const membersData = await userprofileService.fetchAllMembers(AuthData);
  if (membersData) {
    res.status(httpStatus.OK).json({ message: 'Success', members: membersData });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Family Members Not Added' });
  }
});

const notifications = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const notificationsData = await userprofileService.notificationSettings(req.body, AuthData);
  if (notificationsData) {
    res.status(httpStatus.CREATED).json({ notificationsData });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Unable to change notification settings' });
  }
});
const updateprofilepic = catchAsync(async (req, res) => {
  const AuthData = req.SubjectId;
  const profilePhoto = req.files.avatar[0].location;
  const result = await userprofileService.updateProfilePic(profilePhoto, AuthData);
  res.status(httpStatus.OK).json({ message: 'Profile pic updated successfully', result });
});

const getUpcomingEvents = catchAsync(async (req, res) => {
  res.status(httpStatus.OK).json({ message: `TO BE IMPLEMENTED after Discussion` });
});

module.exports = {
  showUserProfile,
  submitBasicDetails,
  fetchBasicDetails,
  addAddressDetails,
  updateAddressDetails,
  fetchAddressDetails,
  updateBasicDetails,
  addMember,
  updateMember,
  deleteMember,
  getAllMembers,
  notifications,
  updateprofilepic,
  getStats,
  getUpcomingEvents,
};
