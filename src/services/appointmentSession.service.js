const AppointmentSession = require('../models/appointmentSession.model');

const saveAppointmentSession = async (appointmentID, AuthData) => {
  const AppointmentSessionData = await AppointmentSession.create({})
};

module.exports = {
  saveAppointmentSession,
};
