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
  internalTeamService,
  appointmentPreferenceService,
} = require('../services');
const { emailService, smsService } = require('../Microservices');
const ApiError = require('../utils/ApiError');

/* Challenge Heirarchy for Onboarding API
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

// Below Function not in use discarded flow
const getOnboardingChallenge = async (AuthData) => {
  let challenge = 'ONBOARDING_ONHOLD';
  let optionalChallenge = 'NONE';
  const IsDoctorVerified = await verifiedDoctorService.checkVerification(AuthData.id);
  if (AuthData.isEmailVerified === false) {
    challenge = 'AUTH_EMAILVERIFY';
  } else if (AuthData.isMobileVerified === false) {
    challenge = 'AUTH_OTPVERIFY';
  } else if (!(await doctorprofileService.fetchbasicdetails(AuthData))) {
    challenge = 'BASIC_DETAILS';
  } else if (!(await documentService.fetchDocumentdata(AuthData))) {
    challenge = 'EDUCATION_DOCUMENTUPLOAD';
  } else if (!(await doctorprofileService.fetcheducationdetails(AuthData))) {
    challenge = 'EDUCATION_DETAILS';
  } else if (!(await doctorprofileService.fetchexperiencedetails(AuthData))) {
    if (IsDoctorVerified) {
      challenge = 'ONBOARDING_SUCCESS';
    }
    optionalChallenge = 'EXPERIENCE_DETAILS';
  } else if (!(await doctorprofileService.fetchClinicdetails(AuthData))) {
    if (IsDoctorVerified) {
      challenge = 'ONBOARDING_SUCCESS';
    }
    optionalChallenge = 'CLINIC_DETAILS';
  } else if (!appointmentPreferenceService.getDoctorPreferences(AuthData)) {
    if (IsDoctorVerified) {
      challenge = 'ONBOARDING_SUCCESS';
    }
    optionalChallenge = 'APPOINTMENT_PREFERENCES';
  } else if (IsDoctorVerified) {
    challenge = 'ONBOARDING_SUCCESS';
    optionalChallenge = 'ONBOARDING_SUCCESS';
  }
  return { challenge, optionalChallenge };
};
const register = catchAsync(async (req, res) => {
  const devicehash = req.headers.devicehash;
  const devicetype = req.headers.devicetype;
  const fcmtoken = req.headers.fcmtoken;
  const AuthData = await authService.createAuthData(req.body);
  const authtoken = await tokenService.generateDoctorToken(AuthData.id);
  await tokenService.addDeviceHandler(AuthData.id, authtoken, req.ip4, devicehash, devicetype, fcmtoken);
  await otpServices.initiateOTPData(AuthData);
  const challenge = await getOnboardingChallenge(AuthData);
  res
    .status(httpStatus.CREATED)
    .json({ AuthData, authtoken, challenge: challenge.challenge, optionalchallenge: challenge.optionalChallenge });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const AuthData = await authService.loginAuthWithEmailAndPassworDoctor(email, password);
  const verifiedcheckData = await verifiedDoctorService.checkVerification(AuthData._id);
  let authtoken = '';
  if (verifiedcheckData) {
    authtoken = await tokenService.generateVerifiedDoctorToken(AuthData.id, verifiedcheckData.docid);
  } else {
    authtoken = await tokenService.generateDoctorToken(AuthData.id);
  }
  const devicehash = req.headers.devicehash;
  const devicetype = req.headers.devicetype;
  const fcmtoken = req.headers.fcmtoken;
  await tokenService.addDeviceHandler(AuthData.id, authtoken, req.ip4, devicehash, devicetype, fcmtoken);
  const challenge = await getOnboardingChallenge(AuthData);
  res.status(httpStatus.OK).json({
    AuthData,
    authtoken,
    challenge: challenge.challenge,
    optionalchallenge: challenge.optionalChallenge,
  });
});

const logout = catchAsync(async (req, res) => {
  await tokenService.logoutdevice(req.body.authtoken);
  res.status(httpStatus.OK).json({ message: 'logged out successfully' });
});

const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (newPassword.length < 8) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'New Password must contain 8 charcters or more');
  }
  const token = checkHeader(req); // Used for Blacklisting Current Token
  await authService.changeAuthPassword(oldPassword, newPassword, token, req.SubjectId);
  // const challenge = await getOnboardingChallenge(AuthData);
  res.status(httpStatus.OK).json({ message: 'Password Changed Successfully' });
});

const forgotPassword = catchAsync(async (req, res) => {
  const service = req.body.choice;
  const OTP = generateOTP();
  if (service === 'email') {
    const AuthData = await authService.getAuthByEmail(req.body.email);
    if (!AuthData) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No account is registered using this email please provide correct email');
    }
    try {
      await emailService.sendResetPasswordEmail(req.body.email, AuthData.fullname, OTP);
    } catch (err) {
      throw new ApiError(httpStatus.NOT_FOUND, `email service: ${err}`);
    }
    await otpServices.sendResetPassOtp(OTP, AuthData);
    const challenge = await getOnboardingChallenge(AuthData);
    res.status(httpStatus.OK).json({
      message: 'Reset Code Sent to Registered Email ID',
      challenge: challenge.challenge,
      optionalchallenge: challenge.optionalChallenge,
    });
  } else if (service === 'phone') {
    const AuthData = await authService.getAuthByPhone(parseInt(req.body.phone, 10));
    if (!AuthData) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No account is registered using this Phone please provide correct Phone');
    }
    try {
      const response2F = await smsService.sendPhoneOtp2F(req.body.phone, OTP);
      const dbresponse = await otpServices.sendResetPassOtp(OTP, AuthData);
      const challenge = await getOnboardingChallenge(AuthData);
      if (response2F && dbresponse) {
        res.status(httpStatus.OK).json({
          message: 'Reset Code Sent to Registered Phone Number',
          challenge: challenge.challenge,
          optionalchallenge: challenge.optionalChallenge,
        });
      }
    } catch (err) {
      throw new ApiError(httpStatus.NOT_FOUND, `sms service: ${err}`);
    }
  }
});

const resetPassword = catchAsync(async (req, res) => {
  const service = req.body.choice;
  let AuthData;
  if (service === 'email') {
    AuthData = await authService.getAuthByEmail(req.body.email);
    await authService.resetPassword(AuthData.email, req.body.resetcode, req.body.newPassword);
  } else if (service === 'phone') {
    AuthData = await authService.getAuthByPhone(req.body.phone);
    await authService.resetPassword(AuthData.email, req.body.resetcode, req.body.newPassword);
  }
  const challenge = await getOnboardingChallenge(AuthData);
  res.status(httpStatus.OK).json({
    message: 'Password Reset Successful',
    challenge: challenge.challenge,
    optionalchallenge: challenge.optionalChallenge,
  });
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const OTP = generateOTP();
  const response = await emailService.sendVerificationEmail(AuthData.email, AuthData.fullname, OTP);
  if (response === true) {
    await otpServices.sendEmailVerifyOtp(OTP, AuthData);
    res.status(httpStatus.OK).json({ message: 'Email Verification Code Sent', challenge: 'AUTH_EMAILVERIFY' });
  } else {
    res.status(httpStatus.BAD_GATEWAY).json({ message: 'Email Verification Not Sent ', response });
  }
});

const changeEmail = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const result = await otpServices.changeEmail(req.body.email, AuthData);
  const AuthDataUpdated = await authService.getAuthById(req.SubjectId);
  const challenge = await getOnboardingChallenge(AuthDataUpdated);
  if (result !== false) {
    return res.status(httpStatus.OK).json({
      message: 'Email is updated sucessfully',
      challenge: challenge.challenge,
      optionalchallenge: challenge.optionalChallenge,
    });
  }
  res.status(httpStatus.BAD_REQUEST).json({
    message: 'Email Already Verified',
    challenge: challenge.challenge,
    optionalchallenge: challenge.optionalChallenge,
  });
});

const changePhone = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const result = await otpServices.changePhone(req.body.phone, AuthData);
  const AuthDataUpdated = await authService.getAuthById(req.SubjectId);
  const challenge = await getOnboardingChallenge(AuthDataUpdated);
  if (result !== false) {
    return res.status(httpStatus.CREATED).json({
      message: 'Phone is updated Sucessfully',
      challenge: challenge.challenge,
      optionalchallenge: challenge.optionalChallenge,
    });
  }
  res.status(httpStatus.BAD_REQUEST).json({
    message: 'Phone Number already verified',
    challenge: challenge.challenge,
    optionalchallenge: challenge.optionalChallenge,
  });
});

const verifyEmail = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const verifystatus = await otpServices.verifyEmailOtp(req.body.emailcode, AuthData);
  const AuthDataUpdated = await authService.getAuthById(verifystatus.auth);
  const challenge = await getOnboardingChallenge(AuthDataUpdated);
  res
    .status(httpStatus.OK)
    .json({ message: 'Email Verified', challenge: challenge.challenge, optionalchallenge: challenge.optionalChallenge });
});

const requestOtp = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const OTP = generateOTP();
  await otpServices.sendPhoneVerifyOtp(OTP, AuthData);
  const AuthDataUpdated = await authService.getAuthById(req.SubjectId);
  const challenge = await getOnboardingChallenge(AuthDataUpdated);
  res.status(httpStatus.OK).json({
    message: 'OTP Sent over Phone',
    challenge: challenge.challenge,
    optionalchallenge: challenge.optionalChallenge,
  });
});

const verifyPhone = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  await otpServices.verifyPhoneOtp(req.body.otp, AuthData);
  const AuthDataUpdated = await authService.getAuthById(req.SubjectId);
  const challenge = await getOnboardingChallenge(AuthDataUpdated);
  res.status(httpStatus.OK).json({
    message: 'Phone Number Verified',
    challenge: challenge.challenge,
    optionalchallenge: challenge.optionalChallenge,
  });
});

const resendOtp = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const OTP = generateOTP();
  await otpServices.resendOtp(OTP, AuthData);
  const AuthDataUpdated = await authService.getAuthById(req.SubjectId);
  const challenge = await getOnboardingChallenge(AuthDataUpdated);
  res.status(httpStatus.OK).json({
    message: 'OTP Sent Over Phone',
    challenge: challenge.challenge,
    optionalchallenge: challenge.optionalChallenge,
  });
});

const tryverification = catchAsync(async (req, res) => {
  const AuthData = await authService.getAuthById(req.SubjectId);
  const educationdata = await doctorprofileService.fetcheducationdetails(AuthData);
  const verifytry = await internalTeamService.checkVerification(AuthData);
  if (!verifytry) {
    const try1 = await internalTeamService.AutoverifyDoctorByBNMC(
      educationdata.registrationNo,
      educationdata.stateMedicalCouncil,
      educationdata.yearofRegistration
    );
    if (try1) {
      res.status(httpStatus.OK).json({ message: 'Your Verification Successful', challenge: 'ONBOARDING_SUCCESS' });
    } else {
      res.status(httpStatus.BAD_REQUEST).json({ message: 'Your Verification is Pending', challenge: 'ONBOARDING_ONHOLD' });
    }
  } else {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'You are already verified!', challenge: 'ONBOARDING_SUCCESS' });
  }
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
  tryverification,
};
