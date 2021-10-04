const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const generateOTP = require('../utils/generateOTP');
const checkHeader = require('../utils/chechHeader');
const {
  authService,
  tokenService,
  otpServices,
  verifiedDoctorService,
  doctorprofileService,
  documentService,
} = require('../services');
const { emailService } = require('../Microservices');

/* Challenge Heirarchy for Onboarding API
AUTH_REGISTER
AUTH_LOGIN
AUTH_EMAILVERIFY
AUTH_OTPVERIFY
BASIC_DETAILS
EDUCATION_DETAILS
EDUCATION_DOCUMENTUPLOAD
EXPERIENCE_DETAILS
CLINIC_DETAILS
ONBOARDING_SUCCESS
ONBOARDING_ONHOLD
*/

const getOnboardingChallenge = async (AuthData) => {
  let challenge = 'ONBOARDING_ONHOLD';
  if (AuthData.isEmailVerified === false) {
    challenge = 'AUTH_EMAILVERIFY';
  } else if (AuthData.isMobileVerified === false) {
    challenge = 'AUTH_OTPVERIFY';
  } else if (!(await doctorprofileService.fetchbasicdetails(AuthData))) {
    challenge = 'BASIC_DETAILS';
  } else if (!(await doctorprofileService.fetcheducationdetails(AuthData))) {
    challenge = 'EDUCATION_DETAILS';
  } else if (!(await documentService.fetchDocumentdata(AuthData))) {
    challenge = 'EDUCATION_DOCUMENTUPLOAD';
  } else if (!(await doctorprofileService.fetchexperiencedetails(AuthData))) {
    challenge = 'EXPERIENCE_DETAILS';
  } else if (!(await doctorprofileService.fetchClinicdetails(AuthData))) {
    challenge = 'CLINIC_DETAILS';
  } else if (await verifiedDoctorService.checkVerification(AuthData.auth)) {
    challenge = 'ONBOARDING_SUCCESS';
  }
  return challenge;
};

const register = catchAsync(async (req, res) => {
  const devicehash = req.headers.devicehash;
  const devicetype = req.headers.devicetype;
  const fcmtoken = req.headers.fcmtoken;
  const AuthData = await authService.createAuthData(req.body);
  const authtoken = await tokenService.generateDoctorToken(AuthData.id);
  await tokenService.addDeviceHandler(AuthData.id, authtoken, '1.1.1.1', devicehash, devicetype, fcmtoken);
  const challenge = await getOnboardingChallenge(AuthData);
  res.status(httpStatus.CREATED).json({ AuthData, authtoken, challenge });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const AuthData = await authService.loginAuthWithEmailAndPassword(email, password);
  const verifiedcheckData = await verifiedDoctorService.checkVerification(AuthData._id);
  let authtoken = '';
  if (verifiedcheckData) {
    authtoken = await tokenService.generateVerifiedDoctorToken(AuthData.id, verifiedcheckData.Docid);
  } else {
    authtoken = await tokenService.generateDoctorToken(AuthData.id);
  }
  const devicehash = req.headers.devicehash;
  const devicetype = req.headers.devicetype;
  const fcmtoken = req.headers.fcmtoken;
  await tokenService.addDeviceHandler(AuthData.id, authtoken, '1.1.1.1', devicehash, devicetype, fcmtoken);
  const challenge = await getOnboardingChallenge(AuthData);
  res.status(httpStatus.OK).json({ AuthData, authtoken, challenge });
});

const logout = catchAsync(async (req, res) => {
  await tokenService.logoutdevice(req.body.authtoken);
  res.status(httpStatus.OK).json({ message: 'logged out successfully' });
});

const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const token = checkHeader(req); //Used for Blacklisting Current Token
  await authService.changeAuthPassword(oldPassword, newPassword, token, req.SubjectId);
  // const challenge = await getOnboardingChallenge(AuthData);
  res.status(httpStatus.OK).json({ message: 'Password Changed Successfully' });
});

const forgotPassword = catchAsync(async (req, res) => {
  const service = req.body.choice;
  const OTP = generateOTP();
  if (service === 'email') {
    const AuthData = await authService.getAuthByEmail(req.body.email);
    await emailService.sendResetPasswordEmail(req.body.email, OTP);
    const challenge = await getOnboardingChallenge(AuthData);
    res.status(httpStatus.OK).json({ message: 'Reset Code Sent to Registered EmailID', challenge });
  } else {
    const AuthData = await authService.getAuthByPhone(req.body.phone);
    await otpServices.sendresetpassotp(OTP, AuthData);
    const challenge = await getOnboardingChallenge(AuthData);
    res.status(httpStatus.OK).json({ message: 'Reset Code Sent to Registered PhoneNumber', challenge });
  }
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body.email, req.body.resetcode, req.body.newpassword);
  const AuthData = await authService.getAuthByEmail(req.body.email);
  const challenge = await getOnboardingChallenge(AuthData);
  res.status(httpStatus.OK).json({ message: 'Password Reset Successful', challenge });
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const OTP = generateOTP();
  await emailService.sendVerificationEmail(AuthData.email, OTP);
  await otpServices.sendemailverifyotp(OTP, AuthData);
  res.status(httpStatus.OK).json({ message: 'OTP Sent over Email', challenge: 'AUTH_EMAILVERIFY' });
});

const changeEmail = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const result = await otpServices.changeEmail(req.body.email, AuthData);
  const AuthDataUpdated = await authService.getAuthById(req.SubjectId);
  const challenge = await getOnboardingChallenge(AuthDataUpdated);
  if (result !== false) {
    res.status(httpStatus.OK).json({ message: 'Email is updated sucessfully', challenge });
  }
  res.status(httpStatus.BAD_REQUEST).json({ message: 'Email Already Verified', challenge });
});

const changePhone = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const result = await otpServices.changePhone(req.body.phone, AuthData);
  const AuthDataUpdated = await authService.getAuthById(req.SubjectId);
  const challenge = await getOnboardingChallenge(AuthDataUpdated);
  if (result !== false) {
    res.status(httpStatus.CREATED).json({ message: 'Phone is updated sucessfully', challenge });
  }
  res.status(httpStatus.BAD_REQUEST).json({ message: 'Phone Number already verified', challenge });
});

const verifyEmail = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await otpServices.verifyEmailOtp(req.body.emailcode, AuthData);
  const AuthDataUpdated = await authService.getAuthById(req.SubjectId);
  const challenge = await getOnboardingChallenge(AuthDataUpdated);
  res.status(httpStatus.OK).json({ message: 'Email Verified', challenge });
});

const requestOtp = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const OTP = generateOTP();
  await otpServices.sendphoneverifyotp(OTP, AuthData);
  const AuthDataUpdated = await authService.getAuthById(req.SubjectId);
  const challenge = await getOnboardingChallenge(AuthDataUpdated);
  res.status(httpStatus.OK).json({ message: 'OTP Sent over Phone', challenge });
});

const verifyPhone = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await otpServices.verifyPhoneOtp(req.body.otp, AuthData);
  const AuthDataUpdated = await authService.getAuthById(req.SubjectId);
  const challenge = await getOnboardingChallenge(AuthDataUpdated);
  res.status(httpStatus.OK).json({ message: 'Phone Number Verified', challenge });
});

const resendOtp = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const OTP = generateOTP();
  await otpServices.resendOtp(OTP, AuthData);
  const AuthDataUpdated = await authService.getAuthById(req.SubjectId);
  const challenge = await getOnboardingChallenge(AuthDataUpdated);
  res.status(httpStatus.OK).json({ message: 'OTP Sent Over Phone', challenge });
});

const onboardingstatus = catchAsync(async (req, res) => {
  const AuthStatus = {};
  const OnboardingStatusData = {};
  const AuthData = await authService.getAuthById(req.SubjectId);
  let DoctorAlreadyOnboarded = await verifiedDoctorService.checkVerification(req.SubjectId);
  // eslint-disable-next-line no-unused-expressions
  DoctorAlreadyOnboarded === null ? (DoctorAlreadyOnboarded = false) : (DoctorAlreadyOnboarded = true);
  // Auth Status for Onboarding
  AuthStatus.Emailverified = AuthData.isEmailVerified;
  AuthStatus.phoneverified = AuthData.isMobileVerified;
  AuthStatus.banned = AuthData.isbanned;
  // Onboarding steps status
  OnboardingStatusData.basicdetailsSubmitted = await doctorprofileService.fetchbasicdetails(AuthData);
  // eslint-disable-next-line no-unused-expressions
  OnboardingStatusData.basicdetailsSubmitted == null
    ? (OnboardingStatusData.basicdetailsSubmitted = false)
    : (OnboardingStatusData.basicdetailsSubmitted = true);
  OnboardingStatusData.educationdetailsSubmitted = await doctorprofileService.fetcheducationdetails(AuthData);
  // eslint-disable-next-line no-unused-expressions
  OnboardingStatusData.educationdetailsSubmitted == null
    ? (OnboardingStatusData.educationdetailsSubmitted = false)
    : (OnboardingStatusData.educationdetailsSubmitted = true);
  OnboardingStatusData.experiencedetailsSubmitted = await doctorprofileService.fetchexperiencedetails(AuthData);
  // eslint-disable-next-line no-unused-expressions
  OnboardingStatusData.experiencedetailsSubmitted == null
    ? (OnboardingStatusData.experiencedetailsSubmitted = false)
    : (OnboardingStatusData.experiencedetailsSubmitted = true);
  OnboardingStatusData.clinicdetailsSubmitted = await doctorprofileService.fetchClinicdetails(AuthData);
  // eslint-disable-next-line no-unused-expressions
  OnboardingStatusData.clinicdetailsSubmitted == null
    ? (OnboardingStatusData.clinicdetailsSubmitted = false)
    : (OnboardingStatusData.clinicdetailsSubmitted = true);
  // Document Status
  const DocumentStatusData = await documentService.fetchDocumentdata(AuthData);
  res.status(httpStatus.OK).json({ DoctorAlreadyOnboarded, AuthStatus, OnboardingStatusData, DocumentStatusData });
});

module.exports = {
  register,
  onboardingstatus,
  login,
  logout,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  changeEmail,
  changePhone,
  changePassword,
  requestOtp,
  verifyPhone,
  resendOtp,
  getOnboardingChallenge,
};
