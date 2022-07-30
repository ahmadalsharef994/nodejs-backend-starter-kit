const { Prescription, Appointment, ThyrocareOrder, HealthPackage, Followup } = require('../models');

const getUpcomingAppointment = async (auth, options) => {
  const result = await Appointment.paginate(
    { AuthUser: auth, paymentStatus: 'PAID', Status: { $nin: 'cancelled' }, StartTime: { $gte: new Date() } },
    options
  );
  return result;
};

const getAppointmentsByType = async (AuthUser, filter, options) => {
  try {
    if (filter === 'ALL') {
      // eslint-disable-next-line no-param-reassign
      delete filter.Type;
      const result = await Appointment.paginate({ paymentStatus: 'PAID', Status: { $nin: 'cancelled' }, AuthUser }, options);
      return result;
    }
    if (filter === 'PAST') {
      // eslint-disable-next-line no-param-reassign
      delete filter.Type;
      const result = await Appointment.paginate(
        { paymentStatus: 'PAID', Status: { $nin: 'cancelled' }, StartTime: { $lte: new Date() }, AuthUser },
        options
      );
      return result;
    }
    if (filter === 'FOLLOWUP') {
      // eslint-disable-next-line no-param-reassign
      delete filter.Type;
      const result = await Followup.paginate({ AuthUser }, options);
      return result;
    }
    if (filter === 'CANCELLED') {
      // eslint-disable-next-line no-param-reassign
      delete filter.Type;
      const result = await Appointment.paginate({ paymentStatus: 'PAID', Status: { $in: 'cancelled' }, AuthUser }, options);
      return result;
    }
    if (filter === 'TODAY') {
      // eslint-disable-next-line no-param-reassign
      delete filter.Type;
      const date = new Date().toDateString();
      const result = await Appointment.paginate(
        { paymentStatus: 'PAID', Status: { $nin: 'cancelled' }, AuthUser, Date: date },
        options
      );
      return result;
    }
  } catch (err) {
    return null;
  }
};

const getAllPrescriptions = async (auth, options) => {
  const result = await Prescription.paginate({ userAuth: auth }, options);
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
const getNextAppointment = async (AuthUser) => {
  try {
    const upcoming = await Appointment.find({
      AuthUser,
      Date: new Date().toDateString(),
      paymentStatus: 'PAID',
      Status: { $nin: 'cancelled' },
      StartTime: { $gte: new Date() },
    });
    const ongoing = await Appointment.find({
      AuthUser,
      Date: new Date().toDateString(),
      paymentStatus: 'PAID',
      Status: { $nin: 'cancelled' },
      StartTime: { $lte: new Date() },
    });
    if (ongoing.length === 0) {
      return upcoming[0];
    }
    const currenttime = new Date().toLocaleString().split(':')[1];
    const ongoingApp = new Date(`${ongoing[ongoing.length - 1].StartTime}`).toLocaleString().split(':')[1];
    if (currenttime >= ongoingApp) {
      if (currenttime - ongoingApp <= 10) {
        return ongoing[ongoing.length - 1];
      }
      return upcoming[0];
    }
    if (currenttime < ongoingApp) {
      const ongoingtime = 60 - ongoingApp + currenttime;
      if (ongoingtime >= 10) {
        return ongoing[ongoing.length - 1];
      }
      return upcoming[0];
    }
  } catch (err) {
    return null;
  }
};
module.exports = {
  getNextAppointment,
  getUpcomingAppointment,
  getAppointmentsByType,
  getAllPrescriptions,
  getAllLabTestOrders,
  fetchHealthPackages,
};
