/* eslint-disable no-param-reassign */
const VerifiedDoctors = require('../models/verifieddoctor');
const { Appointment, Prescription } = require('../models');

const initiateappointmentviaDoctor = async (appointmentID, AuthData) => {
  // Pusher
  // Dyte
  // SessionToken
  return AuthData;
};

const submitAppointmentDetails = async (docId, userAuth, status, type, startTime, endTime) => {
  const { doctorauthid } = await VerifiedDoctors.findOne({ docid: docId });
  const bookedAppointment = await Appointment.create({
    AuthDoctor: doctorauthid,
    docid: docId,
    AuthUser: userAuth,
    Status: status,
    Type: type,
    StartTime: startTime,
    EndTime: endTime,
    UserDocument: ['some document'],
    UserDescription: 'some prescription',
    HealthIssue: 'some issue',
    DoctorAction: 'Accepted',
    DoctorReason: 'none',
    UserAction: 'Requested Booking',
    UserReason: 'none',
    isRescheduled: false,
    DoctorRescheduleding: null,
  });
  return bookedAppointment;
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
  getappointmentDoctor,
  createPrescriptionDoc,
  fetchPrescriptionDoc,
};
