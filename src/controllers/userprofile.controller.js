const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const userprofileService = require('../services/userprofile.service');
const { authService } = require('../services');

const submitbasicdetails = async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const resultData = await userprofileService.submitbasicdetails(req.body, AuthData);
  if (resultData) {
    res.status(httpStatus.OK).json({ message: 'Basic details submmitted for User', resultData });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Data already submitted' });
  }
};

const fetchbasicdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const basicdata = await userprofileService.fetchbasicdetails(AuthData);
  if (!basicdata) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Your basic details is not added' });
  } else {
    res.status(httpStatus.OK).json({ basicdata });
  }
});

const fetchaddressdetails = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const addressData = await userprofileService.fetchaddressdetails(AuthData);
  if (!addressData) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Your address is not added' });
  } else {
    res.status(httpStatus.OK).json({ addressData });
  }
});

const addAddressdetails = async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const addressDetails = await userprofileService.addAddressdetails(req.body, AuthData);
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
    res.status(httpStatus.BAD_REQUEST).json({ message: 'you can only add five Member' });
  }
};

const updateBasicDetails = async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const updatebasicDetails = await userprofileService.updateBasicDetails(req.body, AuthData);
  if (updatebasicDetails) {
    res.status(httpStatus.OK).json({ message: 'Basic details updated Successfully ' });
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'You have not added your basic details' });
  }
};

module.exports = {
  submitbasicdetails,
  fetchbasicdetails,
  addAddressdetails,
  fetchaddressdetails,
  updateBasicDetails,
  addMember,
};
