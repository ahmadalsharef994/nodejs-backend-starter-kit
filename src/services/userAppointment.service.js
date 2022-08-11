const { Prescription, Appointment, ThyrocareOrder, HealthPackage, doctordetails } = require('../models');

const getUpcomingAppointment = async (auth, endDate, options) => {
  const result = await Appointment.paginate(
    { AuthUser: auth, paymentStatus: 'PAID', Status: { $nin: 'cancelled' }, StartTime: { $gte: new Date(), $lte: endDate } },
    options
  );
  return result;
};

const getAppointmentsByType = async (AuthUser, fromDate, endDate, filter, options) => {
  try {
    if (filter.Type === 'ALL') {
      const result = await Appointment.paginate(
        { paymentStatus: 'PAID', StartTime: { $gte: fromDate, $lt: endDate }, AuthUser },
        options
      );
      return result;
    }
    // else
    const result = await Appointment.paginate(
      {
        AuthUser,
        paymentStatus: 'PAID',
        StartTime: { $gte: fromDate, $lt: endDate },
        Type: filter.Type,
      },
      options
    );
    return result;
  } catch (err) {
    return null;
  }
};

const getAppointmentsByStatus = async (AuthUser, fromDate, endDate, filter, options) => {
  if (filter.Status === 'ALL') {
    const result = await Appointment.paginate({ AuthUser, paymentStatus: 'PAID' }, options);
    return result;
  }
  if (filter.Status === 'TODAY') {
    const result = await Appointment.paginate(
      {
        AuthUser,
        paymentStatus: 'PAID',
        StartTime: { $gte: fromDate, $lt: endDate },
        Date: new Date().toDateString(),
      },
      options
    );
    return result;
  }
  if (filter.Status === 'PAST') {
    const result = await Appointment.paginate(
      { AuthUser, paymentStatus: 'PAID', StartTime: { $gte: fromDate, $lt: new Date() } },
      options
    );
    return result;
  }
  if (filter.Status === 'UPCOMING') {
    const result = await Appointment.paginate(
      {
        AuthUser,
        paymentStatus: 'PAID',
        Status: { $nin: 'cancelled' },
        StartTime: { $gte: new Date(), $lt: endDate },
      },
      options
    );
    return result;
  }
  // else
  const result = await Appointment.paginate(
    {
      AuthUser,
      paymentStatus: 'PAID',
      StartTime: { $gte: fromDate, $lt: endDate },
      Status: filter.Type,
    },
    options
  );
  return result;
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
    let doctorSpeciality = '';
    if (upcoming[0]) {
      const res = await doctordetails.find({ doctorauthId: upcoming[0].AuthDoctor });
      doctorSpeciality = res[0].specializations[0];
      Object.assign(upcoming[0], { doctorSpeciality });
    }
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
    if (ongoing[0]) {
      const res = await doctordetails.find({ doctorauthId: ongoing[ongoing.length - 1].AuthDoctor });
      doctorSpeciality = res[0].specializations[0];
      Object.assign(ongoing[ongoing.length - 1], { doctorSpeciality });
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
  getAppointmentsByStatus,
};
