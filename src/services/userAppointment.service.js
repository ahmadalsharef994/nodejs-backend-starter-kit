const { Prescription, Appointment, ThyrocareOrder } = require('../models');

const getNextAppointment = async (auth, limit) => {
  const result = await Appointment.find({ AuthUser: auth, Status: 'booked' })
    .limit(parseInt(limit, 10))
    .sort([['StartTime', 1]]);
  return result;
};

const getAppointmentsByType = async (filter, options) => {
  if (filter.Type === 'ALL') {
    // eslint-disable-next-line no-param-reassign
    delete filter.Type;
    const result = await Appointment.paginate(filter, options);
    return result;
  }
  const result = await Appointment.paginate(filter, options);
  return result;
};

const getAllPrescriptions = async (auth, options) => {
  const result = await Prescription.paginate({ AuthUser: auth }, options);
  return result;
};

const getAllLabTestOrders = async (auth, options) => {
  const result = await ThyrocareOrder.paginate({ mobile: auth.mobile }, options);
  return result;
};

module.exports = {
  getNextAppointment,
  getAppointmentsByType,
  getAllPrescriptions,
  getAllLabTestOrders,
};
