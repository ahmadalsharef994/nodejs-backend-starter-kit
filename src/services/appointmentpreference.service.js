const httpStatus = require('http-status');
const AppointmentPreference = require('../models/appointmentPreference.model');
const { createSlots, calculateDuration } = require('../utils/SlotsCreator');
const ApiError = require('../utils/ApiError');
// eslint-disable-next-line import/no-useless-path-segments
const { doctorprofileService } = require('../services');

const slotOverlap = (timeSlots) => {
  // input slots should be in ascending order
  const days = Object.keys(timeSlots);
  for (let i = 0; i < days.length; i += 1) {
    if (timeSlots[days[i]].length === 1) {
      // eslint-disable-next-line no-continue
      continue;
    }
    for (let j = 0; j < timeSlots[days[i]].length - 1; j += 1) {
      // enforce minimum 30 mins break betwwen two slots range
      if (
        timeSlots[days[i]][j + 1].FromHour === timeSlots[days[i]][j].ToHour &&
        timeSlots[days[i]][j + 1].FromMinutes >= timeSlots[days[i]][j].ToMinutes + 30
      ) {
        break;
      }
      // if overlapping exist return true
      if (timeSlots[days[i]][j + 1].FromHour < timeSlots[days[i]][j].ToHour + 1) {
        return true;
      }
    }
  }
  return false;
};
const checkforDoctorPreference = async (AuthData) => {
  const preference = await AppointmentPreference.find({ doctorAuthId: AuthData._id });
  if (typeof preference[0] === 'object') {
    return preference;
  }
  return null;
};
const checkForAppointmentPrice = async (AuthData) => {
  const basicDetails = await doctorprofileService.fetchbasicdetails(AuthData);
  if (!basicDetails || !basicDetails.appointmentPrice) {
    return false;
  }
  return true;
};

const createPreference = async (body, doctorID, AuthData, update = false) => {
  const alreadyExist = await AppointmentPreference.findOne({ docid: doctorID, doctorAuthId: AuthData });
  if (alreadyExist && !update) {
    return Promise.reject(
      new ApiError(httpStatus.FORBIDDEN, 'Appointment preference already exist!. Please update them instead!')
    );
  }
  // check for time overlap
  const overlapping = slotOverlap(body);
  if (overlapping) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Overlapped time slots not allowed! maintain 30 mins gap');
  }

  const result = {};
  const days = Object.keys(body);

  const durations = [];
  for (let i = 0; i < days.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    durations.push(await calculateDuration(body[days[i]]));
  }

  const validDurations = durations.every((durationArr) => {
    return durationArr.every((dur) => {
      return !(dur % 40) && dur >= 120;
    });
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
  // console.log(daysAndDurations);
  // creating slots for each day

  for (let i = 0; i < days.length; i += 1) {
    /* converting 12hr to 24hr if input is in 12hr format
    const startHr = body[days[i]].FromMeridian === 1 ? (body[days[i]].FromHour + 12) % 24 : body[days[i]].FromHour;
    const startMin = body[days[i]].FromMinutes;
    */

    for (let j = 0; j < body[days[i]].length; j += 1) {
      const startHr = body[days[i]][j].FromHour;
      const startMin = body[days[i]][j].FromMinutes;
      // eslint-disable-next-line no-await-in-loop
      const element = await createSlots(
        { FromHour: startHr, FromMinute: startMin },
        days[i],
        doctorID,
        daysAndDurations[days[i]][j]
      );
      slots.push(element);
    }
  }

  const finalSlots = [];
  let ASlots = [];
  let FSlots = [];
  let k = 0;

  for (let i = 0; i < days.length; i += 1) {
    ASlots = [];
    FSlots = [];
    for (let j = 0; j < body[days[i]].length; j += 1) {
      ASlots.push(...slots[k][0]);
      FSlots.push(...slots[k][1]);
      k += 1;
    }
    finalSlots.push([ASlots, FSlots]);
  }

  const Adays = days.map((day) => day.concat('_A'));
  const Fdays = days.map((day) => day.concat('_F'));

  Adays.forEach((day, i) => {
    result[day] = finalSlots[i][0];
  });

  Fdays.forEach((day, i) => {
    result[day] = finalSlots[i][1];
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
  checkForAppointmentPrice,
  createPreference,
  updatePreference,
  getfollowups,
  getappointments,
  slotOverlap,
  checkforDoctorPreference,
};
