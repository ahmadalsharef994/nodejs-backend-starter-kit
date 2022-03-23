const { Prescription, Appointment, ThyrocareOrder, HealthPackage } = require('../models');

const getNextAppointment = async (auth, limit) => {
  const result = await Appointment.find({ AuthUser: auth, paymentStatus: 'PAID' })
    .limit(parseInt(limit, 10))
    .sort([['StartTime', 1]]);
  return result;
};

const getAppointmentsByType = async (filter, options) => {
  if (filter.Type === 'ALL') {
    // eslint-disable-next-line no-param-reassign
    delete filter.Type;
    const result = await Appointment.paginate({ paymentStatus: 'PAID' }, filter, options);
    return result;
  }
  const result = await Appointment.paginate({ paymentStatus: 'PAID' }, filter, options);
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
const fetchHealthPackages = async () => {
  const healthpackage = await HealthPackage.find({});
  return { Healthpackages: healthpackage };
};

module.exports = {
  getNextAppointment,
  getAppointmentsByType,
  getAllPrescriptions,
  getAllLabTestOrders,
  fetchHealthPackages,
};
