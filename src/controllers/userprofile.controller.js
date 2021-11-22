const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const userprofileService = require('../services/userprofile.service');
const { authService } = require('../services');

const submitBasicDetails = async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const resultData = await userprofileService.submitBasicDetails(req.body, AuthData);
  if (resultData) {
    res.status(httpStatus.OK).json({ message: 'Basic details submmitted for User', resultData });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Data already submitted' });
  }
};

const fetchBasicDetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const basicdata = await userprofileService.fetchBasicDetails(AuthData);
  if (!basicdata) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Your basic details is not added' });
  } else {
    res.status(httpStatus.OK).json({ basicdata });
  }
});

const updateBasicDetails = async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const updatebasicDetails = await userprofileService.updateBasicDetails(req.body, AuthData);
  if (updatebasicDetails) {
    res.status(httpStatus.OK).json({ message: 'Basic details updated Successfully ' });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'You have not added your basic details' });
  }
};

const fetchAddressDetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const addressData = await userprofileService.fetchAddressDetails(AuthData);
  if (!addressData) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Your address is not added' });
  } else {
    res.status(httpStatus.OK).json({ addressData });
  }
});

const addAddressDetails = async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const addressDetails = await userprofileService.addAddressDetails(req.body, AuthData);
  if (addressDetails) {
    res.status(httpStatus.OK).json({ message: 'Address details added ', addressDetails });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'unable to add address' });
  }
};

const addMember = async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const addressDetails = await userprofileService.addMember(req.body, AuthData);
  if (addressDetails) {
    res.status(httpStatus.OK).json({ message: 'New Member added ', addressDetails });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'You can only add five Member' });
  }
};

const deleteMember = async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const deletedMember = await userprofileService.deleteMember(req.body, AuthData);
  if (deletedMember === true) {
    res.status(httpStatus.OK).json({ message: 'User Deleted Successfully' });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: "User doesn't Exist " });
  }
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
