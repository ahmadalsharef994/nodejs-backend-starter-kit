/* eslint-disable no-param-reassign */
const VerifiedDoctors = require('../models/verifieddoctor');
const { Appointment, Followup, Prescription } = require('../models');

const initiateappointmentviaDoctor = async (appointmentID, AuthData) => {
  // Pusher
  // Dyte
  // SessionToken
  return AuthData;
};

const submitAppointmentDetails = async (doctorId, userAuth, startTime, endTime) => {
  const { doctorauthid } = await VerifiedDoctors.findOne({ docid: doctorId });
  const bookedAppointment = await Appointment.create({
    AuthDoctor: doctorauthid,
    docid: doctorId,
    AuthUser: userAuth,
    Status: 'SCHEDULED',
    Type: 'PREBOOKED',
    StartTime: startTime,
    EndTime: endTime,
    UserDocument: ['some document'],
    UserDescription: 'some description',
    HealthIssue: 'some issue',
    DoctorAction: 'Pending',
    DoctorReason: 'none',
    UserAction: 'Requested Booking',
    UserReason: 'none',
    isRescheduled: false,
    DoctorRescheduleding: null,
  });
  return bookedAppointment;
};

const submitFollowupDetails = async (appointmentId, startTime, endTime) => {
  const AppointmentData = await Appointment.findById(appointmentId);
  const assignedFollowup = await Followup.create({
    Appointment: AppointmentData,
    StartTime: startTime,
    EndTime: endTime,
    FollowupNo: '1',
    FollowupDocs: ['some document'],
    Status: 'SCHEDULED',
  });
  return assignedFollowup;
};

const getUpcomingAppointments = async (doctorId) => {
  const promise = await Appointment.find(
    { docid: doctorId, Status: 'SCHEDULED' },
    { AuthUser: 1, StartTime: 1, EndTime: 1, Type: 1, Status: 1 }
  ).limit(1); // sort using StartTIme and limit
  return promise;
};

// get all appointments (implement query)
const getAllAppointments = async (doctorId, type) => {
  if (!type) {
    const promise = await Appointment.find({ docid: doctorId }).sort();
    // sort using StartTIme
    return promise;
  }
  const promise = await Appointment.find({ docid: doctorId, Type: type }).sort();
  // sort using StartTIme
  return promise;
};

const getFollowups = async (appointmentId) => {
  const promise = await Followup.find({ Appointment: appointmentId, Status: 'SCHEDULED' }).sort('-date');
  // sort using StartTIme
  return promise;
};

const getappointmentDoctor = async (appointmentID) => {
  const DoctorAppointmentExist = await Appointment.findOne({ _id: appointmentID });
  if (DoctorAppointmentExist) {
    return DoctorAppointmentExist;
  }
  return false;
};

const fetchPrescriptionDoc = async (prescriptionid) => {
  const DoctorPrescriptionDocument = await Prescription.findOne({ _id: prescriptionid });
  if (DoctorPrescriptionDocument) {
    return DoctorPrescriptionDocument;
  }
  return false;
};

const createPrescriptionDoc = async (prescriptionDoc, appointmentID) => {
  const alreadyExist = await fetchPrescriptionDoc(appointmentID);
  if (!alreadyExist) {
    prescriptionDoc.Appointment = appointmentID;
    const DoctorPrescriptionDocument = await Prescription.create(prescriptionDoc);
    return DoctorPrescriptionDocument;
  }
  return false;
};

module.exports = {
  initiateappointmentviaDoctor,
  submitAppointmentDetails,
  submitFollowupDetails,
  getUpcomingAppointments,
  getAllAppointments,
  getFollowups,
  getappointmentDoctor,
  createPrescriptionDoc,
  fetchPrescriptionDoc,
};
