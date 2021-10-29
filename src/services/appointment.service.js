const VerifiedDoctors = require('../models/verifieddoctor');
const Appointment = require('../models/appointment.model');

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

module.exports = {
  initiateappointmentviaDoctor,
  submitAppointmentDetails,
};
