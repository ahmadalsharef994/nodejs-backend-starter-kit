const AppointmentPreference = require('../models/appointmentPreference.model');
const createSlots = require('../middlewares/createAppointmentSlots');

/**
 * @param {Object} timeObj : {{"FromHour": 11,"FromMinutes": 0,"FromMeridian": 1,"ToHour": 2,"ToMinutes": 0,"ToMeridian": 0} //12hr format
 * @returns {Object} totalTime
 */

const calculateDuration = async (timeObj) => {
  const startTimeHour = timeObj.FromMeridian === 1 ? (timeObj.FromHour + 12) % 24 : timeObj.FromHour;
  const startTimeMinute = timeObj.FromMinutes;
  const endTimeHour = timeObj.ToMeridian === 1 ? (timeObj.ToHour + 12) % 24 : timeObj.ToHour;
  const endTimeMinute = timeObj.ToMinutes;
  let totalTime =
    startTimeMinute <= endTimeMinute
      ? (endTimeHour - startTimeHour) * 60 + (endTimeMinute - startTimeMinute)
      : (endTimeHour - 1 - startTimeHour) * 60 + (endTimeMinute + 60 - startTimeMinute);
  totalTime = totalTime > 0 ? totalTime : 1440 + totalTime;
  return totalTime;
};

const checkPreference = async (doctorID) => {
  const PreferenceExist = await AppointmentPreference.findOne({ verifieddocid: doctorID });
  return PreferenceExist;
};

const createPreference = async (body, doctorID, update = false) => {
  const alreadyExist = await checkPreference(doctorID);
  if (alreadyExist && !update) {
    return 'Appointment Slots already added please Update';
  }

  const result = {};
  const days = Object.keys(body);

  const noOfSlots = [];
  for (let i = 0; i < days.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    noOfSlots.push((await calculateDuration(body[days[i]])) / 15);
  }

  const daysAndSlots = {};
  days.forEach((day, i) => {
    daysAndSlots[day] = noOfSlots[i];
  });

  const slots = [];
  // creating slots for each day
  for (let i = 0; i < days.length; i += 1) {
    // converting 12hr to 24hr
    const startHr = body[days[i]].FromMeridian === 1 ? (body[days[i]].FromHour + 12) % 24 : body[days[i]].FromHour;
    const startMin = body[days[i]].FromMinutes;
    // eslint-disable-next-line no-await-in-loop
    const element = await createSlots({ FromHour: startHr, FromMinute: startMin }, days[i], doctorID, daysAndSlots[days[i]]);
    slots.push(element);
  }

  const Adays = days.map((day) => day.concat('_A'));
  const Fdays = days.map((day) => day.concat('_F'));

  Adays.forEach((day, i) => {
    result[day] = slots[i][0];
  });

  Fdays.forEach((day, i) => {
    result[day] = slots[i][1];
  });

  if (!update) {
    result.verifieddocid = doctorID;
    await AppointmentPreference.create(result);
  }
  return result;
};

const updatePreference = async (body, doctorId) => {
  const result = await createPreference(body, doctorId, true);
  const promise = await AppointmentPreference.findOneAndUpdate(
    { verifieddocid: doctorId },
    result,
    { useFindAndModify: false, new: true },
    (err, docs) => {
      if (err) {
        return err;
      }
      return docs;
    }
  ).exec();
  return promise;
};

const getfollowups = async (doctorId) => {
  const promise = await AppointmentPreference.findOne(
    { verifieddocid: doctorId },
    { MON_F: 1, TUE_F: 1, WED_F: 1, THU_F: 1, FRI_F: 1, SAT_F: 1, SUN_F: 1, verifieddocid: 1 }
  );
  return promise;
};

const getappointments = async () => {
  const promise = await AppointmentPreference.find(
    {},
    { MON_A: 1, TUE_A: 1, WED_A: 1, THU_A: 1, FRI_A: 1, SAT_A: 1, SUN_A: 1, verifieddocid: 1 }
  );
  return promise;
};

module.exports = {
  createPreference,
  updatePreference,
  getfollowups,
  getappointments,
};