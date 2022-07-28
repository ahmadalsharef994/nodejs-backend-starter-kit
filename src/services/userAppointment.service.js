const { Prescription, Appointment, ThyrocareOrder, HealthPackage } = require('../models');

const getUpcomingAppointment = async (auth, options) => {
  const result = await Appointment.paginate(
    { AuthUser: auth, paymentStatus: 'PAID', Status: { $nin: 'cancelled' }, StartTime: { $gte: new Date() } },
    options
  );
  return result;
};

const getAppointmentsByType = async (AuthUser, filter, options) => {
  if (filter === 'ALL') {
    // eslint-disable-next-line no-param-reassign
    delete filter.Type;
    const result = await Appointment.paginate({ paymentStatus: 'PAID', Status: { $nin: 'cancelled' }, AuthUser }, options);
    return result;
  }

  const result = await Appointment.paginate({ paymentStatus: 'PAID', AuthUser }, options);
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
