/* eslint-disable no-param-reassign */
/* eslint-disable array-callback-return */
/* eslint-disable no-plusplus */
const httpStatus = require('http-status');
const AppointmentPreference = require('../models/appointmentPreference.model');
const Appointment = require('../models/appointment.model');
const doctordetails = require('../models/doctordetails.model');
// const { createSlots, calculateDuration } = require('../utils/SlotsCreator');
const ApiError = require('../utils/ApiError');
const doctorprofileService = require('./doctorprofile.service');

const slotTime = 15;
const weekday = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const getDoctorPreferences = async (AuthData) => {
  const preference = await AppointmentPreference.find({ doctorAuthId: AuthData._id });
  if (typeof preference[0] === 'object') {
    return preference;
  }
  return null;
};
const getAvailableSlots = async (docid, date) => {
  const AllAppointmentSlots = await AppointmentPreference.findOne({ docid });
  if (!AllAppointmentSlots) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No Appointment Slots Found');
  }
  let bookedAppointmentSlots;
  if (date) {
    bookedAppointmentSlots = await Appointment.find({
      docid,
      Date: date,
      paymentStatus: 'PAID',
      StartTime: { $gte: new Date(), $lte: new Date().getTime() + 7 * 24 * 60 * 60 * 1000 },
    });
  }
  bookedAppointmentSlots = await Appointment.find({
    docid,
    paymentStatus: 'PAID',
    StartTime: { $gte: new Date(), $lte: new Date().getTime() + 7 * 24 * 60 * 60 * 1000 },
  });
  if (bookedAppointmentSlots === []) {
    const availableAppointmentSlots = AllAppointmentSlots;
    return availableAppointmentSlots;
  }
  const bookedSlotIds = bookedAppointmentSlots.map((item) => item.slotId);
  const availableAppointmentSlots = {};
  for (let i = 0; i < 7; i += 1) {
    availableAppointmentSlots[`${weekday[i]}`] = AllAppointmentSlots[`${weekday[i]}`].filter(
      (item) => !bookedSlotIds.includes(item.slotId)
    );
  }
  return availableAppointmentSlots;
};
const checkForAppointmentPrice = async (doctorId) => {
  const basicDetails = await doctorprofileService.fetchbasicdetails(doctorId);
  if (!basicDetails || !basicDetails.appointmentPrice) {
    return false;
  }
  return true;
};

const generateSlots = (fhr, fmin, thr, tmin, day) => {
  const slots = [];
  let startMin = fmin;
  let startHr = fhr;
  const jump = ((thr - fhr) * 60 + (tmin - fmin)) / 15;
  for (let i = 0; i < jump; i++) {
    let flag = false;
    let endMin = startMin + slotTime;
    let endHr = startHr;
    if (endMin >= 60) {
      endMin -= 60;
      flag = true;
    }
    if (flag) endHr++;
    const slotId = [day, startHr, startMin + 1, endHr, endMin].join('-');
    const obj = { slotId, FromHour: startHr, FromMinutes: startMin + 1, ToHour: endHr, ToMinutes: endMin };
    slots.push(obj);
    startHr = endHr;
    startMin = endMin;
  }
  return slots;
};

// const createSlots = async (startTime, day, docId, duration) => { xxxxx }

const updateAppointmentPreference = async (preferences, doctorAuthId, docid) => {
  let existingSlots = await AppointmentPreference.findOne({ doctorAuthId });
  // if no existing slots, initiate object with null values and weekdays as keys
  if (!existingSlots) {
    existingSlots = {};
    const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    weekDays.forEach((day) => {
      existingSlots[day] = null;
    });
    existingSlots = await AppointmentPreference.create({ doctorAuthId, docid, ...existingSlots });
  }
  Object.keys(preferences).map((day) => {
    // eslint-disable-next-line array-callback-return
    preferences[day].map((range) => {
      if (range.ToHour < range.FromHour) {
        throw new ApiError(httpStatus.BAD_REQUEST, `range must be in the same day`);
      }
      if (!existingSlots[day]) existingSlots[day] = [];
      let newSlots = generateSlots(range.FromHour, range.FromMinutes, range.ToHour, range.ToMinutes, day);
      newSlots = newSlots.filter((newSlot) => {
        return existingSlots[day].every(
          (existingSlot) => existingSlot.FromHour !== newSlot.FromHour || existingSlot.FromMinutes !== newSlot.FromMinutes
        );
      });
      existingSlots[`${day}`].push(...newSlots);
    });
  });
  Object.keys(existingSlots.toJSON()).forEach((day) => {
    if (['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].includes(day)) {
      existingSlots[day] = existingSlots[day].sort((a, b) => {
        if (a.FromHour === b.FromHour) {
          return a.FromMinutes - b.FromMinutes;
        }
        return a.FromHour - b.FromHour;
      });
    }
  });

  await existingSlots.save();
  const Slots = await getAvailableSlots(docid);
  await doctordetails.updateOne({ doctorauthId: doctorAuthId }, { $set: { Slots } });
  return existingSlots;
};

const getAppointmentPreferences = async (doctorId) => {
  const appointmentPreference = await AppointmentPreference.findOne({ doctorAuthId: doctorId });
  return appointmentPreference;
};

module.exports = {
  checkForAppointmentPrice,
  updateAppointmentPreference,
  getAppointmentPreferences,
  getDoctorPreferences,
  getAvailableSlots,
};
