/* eslint-disable no-param-reassign */
/* eslint-disable array-callback-return */
/* eslint-disable no-plusplus */
const httpStatus = require('http-status');
const AppointmentPreference = require('../models/appointmentPreference.model');
const { createSlots, calculateDuration } = require('../utils/SlotsCreator');
const ApiError = require('../utils/ApiError');
// eslint-disable-next-line import/no-useless-path-segments
const { doctorprofileService } = require('../services');

const gap = parseInt(process.env.GAP, 10);
const slotTime = parseInt(process.env.SLOT_TIME, 10);
const duration = parseInt(process.env.DURATION, 10);
const jump = parseInt(duration / slotTime, 10);

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

const createpreference = async (body, doctorID, AuthData, update = false) => {
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
      return dur === 120;
    });
  });
  if (!validDurations) {
    return Promise.reject(
      new ApiError(httpStatus.FORBIDDEN, 'Difference between "Start Time" and "End Time" should be 120 mins')
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

const checkOverlap = (currentSlots, range) => {
  let postCheckFlag = -1;

  for (let i = 0; i < currentSlots.length; i += jump) {
    const currentStart = currentSlots[i];
    const currentEnd = currentSlots[i + jump - 1];

    const preCheck =
      (currentStart.FromMinutes - 1 === 0
        ? (currentStart.FromHour - 1) * 60 + 60
        : currentStart.FromHour * 60 + currentStart.FromMinutes - 1) -
      (range[3] === 0 ? (range[2] - 1) * 60 + 60 : range[2] * 60 + range[3]);

    const postCheck =
      (range[1] === 0 ? (range[0] - 1) * 60 + 60 : range[0] * 60 + range[1]) -
      (currentEnd.ToMinutes === 0 ? (currentEnd.ToHour - 1) * 60 + 60 : currentEnd.ToHour * 60 + currentEnd.FromMinutes);

    if (preCheck >= gap) {
      if (postCheckFlag === 1 || i === 0) return { isAllowed: true, index: i };
    }

    // eslint-disable-next-line no-unused-expressions
    postCheck >= gap ? (postCheckFlag = 1) : (postCheckFlag = -1);
  }
  // index = -1 indicates push at the end
  return postCheckFlag === 1 || currentSlots.length === 0 ? { isAllowed: true, index: -1 } : { isAllowed: false };
};

const generateSlots = (fhr, fmin) => {
  const slots = [];
  let startMin = fmin;
  let startHr = fhr;
  for (let i = 0; i < jump; i++) {
    let flag = false;
    let endMin = startMin + slotTime;
    let endHr = startHr;

    if (endMin >= 60) {
      endMin -= 60;
      flag = true;
    }
    if (flag) endHr++;
    const obj = { FromHour: startHr, FromMinutes: startMin + 1, ToHour: endHr, ToMinutes: endMin };
    slots.push(obj);
    startHr = endHr;
    startMin = endMin;
  }
  return slots;
};

const updatePreference = async (body, doctorId) => {
  const existingSlots = await AppointmentPreference.findOne({ docid: doctorId });
  Object.keys(body).map((day) => {
    // eslint-disable-next-line array-callback-return
    body[day].map((range) => {
      if (range.ToHour * 60 + range.ToMinutes - (range.FromHour * 60 + range.FromMinutes) !== duration) {
        throw new ApiError(httpStatus.BAD_REQUEST, `duration must be ${duration}`);
      }
      if (range.ToMinutes < gap) {
        range.ToMinutes = 60 - gap + range.ToMinutes;
        range.ToHour -= 1;
      } else {
        range.ToMinutes -= gap;
      }
      const resultCheck = checkOverlap(existingSlots[`${day}_A`], Object.values(range));

      if (resultCheck.isAllowed) {
        // eslint-disable-next-line no-unused-expressions
        resultCheck.index === -1
          ? existingSlots[`${day}_A`].push(...generateSlots(...Object.values(range).slice(0, 2)))
          : (existingSlots[`${day}_A`] = [
              ...existingSlots[`${day}_A`].slice(0, resultCheck.index),
              ...generateSlots(...Object.values(range).slice(0, 2)),
              ...existingSlots[`${day}_A`].slice(resultCheck.index),
            ]);
      } else {
        throw new ApiError(httpStatus.BAD_REQUEST, `slots are overlapping`);
      }
    });
  });
  // console.log(existingSlots);
  await existingSlots.save();
  return existingSlots;
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

const checkAppointmentPreference = async (docid, doctorauth) => {
  try {
    const { doctorAuthId } = await AppointmentPreference.findOne({ docid });
    if (`${doctorauth}` === `${doctorAuthId}`) {
      return true;
    }
  } catch (err) {
    return false;
  }
};

module.exports = {
  checkForAppointmentPrice,
  createpreference,
  updatePreference,
  getfollowups,
  getappointments,
  slotOverlap,
  checkforDoctorPreference,
  checkAppointmentPreference,
};
