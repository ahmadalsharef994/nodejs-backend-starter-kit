const httpStatus = require('http-status');
const AppointmentPreference = require('../models/appointmentPreference.model');
const { createSlots, calculateDuration } = require('../utils/SlotsCreator');
const ApiError = require('../utils/ApiError');

const createPreference = async (body, doctorID, AuthData, update = false) => {
  const alreadyExist = await AppointmentPreference.findOne({ docid: doctorID, doctorAuthId: AuthData });
  if (alreadyExist && !update) {
    return Promise.reject(
      new ApiError(httpStatus.FORBIDDEN, 'Appointment preference already exist!. Please update them instead!')
    );
  }

  const result = {};
  const days = Object.keys(body);

  const durations = [];
  for (let i = 0; i < days.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    durations.push(await calculateDuration(body[days[i]]));
  }

  const validDurations = durations.every((duration) => {
    return !(duration % 40) && duration >= 120;
  });

  if (!validDurations) {
    return Promise.reject(
      new ApiError(
        httpStatus.FORBIDDEN,
        'Difference between "Start Time" and "End Time" should be atleast 120 mins and divisible by 40'
      )
    );
  }

  const daysAndDurations = {};
  days.forEach((day, i) => {
    daysAndDurations[day] = durations[i];
  });

  const slots = [];
  // creating slots for each day
  for (let i = 0; i < days.length; i += 1) {
    /* converting 12hr to 24hr if input is in 12hr format
    const startHr = body[days[i]].FromMeridian === 1 ? (body[days[i]].FromHour + 12) % 24 : body[days[i]].FromHour;
    const startMin = body[days[i]].FromMinutes;
    */
    const startHr = body[days[i]].FromHour;
    const startMin = body[days[i]].FromMinutes;
    // eslint-disable-next-line no-await-in-loop
    const element = await createSlots(
      { FromHour: startHr, FromMinute: startMin },
      days[i],
      doctorID,
      daysAndDurations[days[i]]
    );
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
    result.docid = doctorID;
    result.doctorAuthId = AuthData;
    await AppointmentPreference.create(result);
  }
  return result;
};

const updatePreference = async (body, doctorId, AuthData) => {
  const result = await createPreference(body, doctorId, AuthData, true);
  const promise = await AppointmentPreference.findOneAndUpdate(
    { docid: doctorId, doctorAuthId: AuthData },
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
    { docid: doctorId },
    { MON_F: 1, TUE_F: 1, WED_F: 1, THU_F: 1, FRI_F: 1, SAT_F: 1, SUN_F: 1, docid: 1, auth: 1 }
  );
  return promise;
};

const getappointments = async (doctorId) => {
  const promise = await AppointmentPreference.findOne(
    { docid: doctorId },
    { MON_A: 1, TUE_A: 1, WED_A: 1, THU_A: 1, FRI_A: 1, SAT_A: 1, SUN_A: 1, docid: 1, auth: 1 }
  );
  return promise;
};

module.exports = {
  createPreference,
  updatePreference,
  getfollowups,
  getappointments,
};
