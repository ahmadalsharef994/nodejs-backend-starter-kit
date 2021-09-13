const randomstring = require('randomstring');
const { AppointmentPref } = require('../models');
const Appointment = require('../models/appointmentpref.model');
const ApiError = require('../utils/ApiError');

/**
 * Create a Slot
 * @param {Object} startTime : {FromHour: 5, FromMinute: 45} //24hr format
 * @param {String} day : "MON", "TUE", ...
 * @param {String} docId : "verifieddocid"
 * @param {Number} numberOfSlots
 * @returns {Promise<Auth>}
 */

const createSlots = (startTime, day, docId, numberOfSlots) => {
  let typeAF = 'A';
  // calculate no. of A 3:1 ratio
  let noOfA = Math.floor((numberOfSlots / 4) * 3);
  const slotA = [];
  const slotF = [];
  let FromHr = startTime.FromHour;
  let FromMins = startTime.FromMinute;
  let ToHr = startTime.FromHour;
  let ToMins = startTime.FromMinute;
  let incrementer = 15;

  for (let i = 0; i < numberOfSlots; i += 1) {
    if (!noOfA) {
      typeAF = 'F';
      incrementer = 10;
    }
    ToMins = (FromMins + incrementer) % 60 ? FromMins + incrementer : 0;
    ToHr = ToMins === 0 ? ToHr + 1 : ToHr;
    if (ToMins > 60) {
      ToMins %= 60;
      ToHr += 1;
    }
    ToHr %= 24;

    // console.log(ToMins, "  mins  ", ToHr, " hr")
    const slot = {};
    slot.slotId = [typeAF, day, docId, randomstring.generate(6).toUpperCase()].join('-');
    slot.FromHour = FromHr;
    slot.FromMinutes = FromMins + 1;
    slot.ToHour = ToHr;
    slot.ToMinutes = ToMins;

    // eslint-disable-next-line no-unused-expressions
    typeAF === 'A' ? slotA.push(slot) : slotF.push(slot);
    FromHr = ToHr;
    FromMins = ToMins;
    noOfA -= 1;
  }
  return [slotA, slotF];
};

/**
 * @param {Object} timeObj : {{"FromHour": 11,"FromMinutes": 0,"FromMeridian": 1,"ToHour": 2,"ToMinutes": 0,"ToMeridian": 0} //12hr format
 * @returns {Object} totalTime
 */

const calculateDuration = (timeObj) => {
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

const createPrefSlots = async (body, doctorID, update = false) => {
  const alreayExist = await checkPreferenceSlot(doctorID);
  if (!alreayExist) {
    const days = Object.keys(body);
    const noOfSlots = [];
    for (let i = 0; i < days.length; i += 1) {
      noOfSlots.push(calculateDuration(body[days[i]]));
    }
    const daysAndSlots = {};
    days.forEach((day, i) => {
      daysAndSlots[day] = noOfSlots[i];
    });

    console.log(daysAndSlots.MON);
    let minutesOfA = Math.floor((daysAndSlots.MON / 4) * 3);
    let minutesOfF = daysAndSlots.MON - minutesOfA;
    console.log(Math.floor(minutesOfA / 15));
    console.log(Math.floor(minutesOfF / 10));
    
// 115 = 86.25 , 28.75

    const appointmentslotdata = await VerifiedDoctors.create({ verifiedby: AuthData._id, docid: docId });
    return appointmentslotdata;
  }
  throw new ApiError(400, 'Appointment Slots already added please Update');
};

const checkPreferenceSlot = async (doctorID) => {
  const SlotsExist = await AppointmentPref.findOne({ verifieddocid: doctorID });
  return SlotsExist;
};

const setpref = async (body, doctorID, update = false) => {
  const result = {};
  const days = Object.keys(body);

  const noOfSlots = [];
  for (let i = 0; i < days.length; i += 1) {
    noOfSlots.push(calculateDuration(body[days[i]]) / 15);
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
    const element = createSlots({ FromHour: startHr, FromMinute: startMin }, days[i], doctorID, daysAndSlots[days[i]]);
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
    result._id = doctorID;
    console.log(result);
    await Appointment.create(result);
  }
  return result;
};



const updatepref = async (body, docId) => {
  const promise = await Appointment.findOneAndUpdate(
    { _id: docId },
    setpref(body, docId, true),
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

const getfollowups = async (docId) => {
  const promise = await Appointment.findOne(
    { _id: docId },
    { MON_A: 0, TUE_A: 0, WED_A: 0, THU_A: 0, FRI_A: 0, SAT_A: 0, SUN_A: 0 }
  ).exec();
  return promise;
};

const getappointments = async () => {
  const promise = await Appointment.find(
    {},
    { MON_A: 1, TUE_A: 1, WED_A: 1, THU_A: 1, FRI_A: 1, SAT_A: 1, SUN_A: 1 }
  ).exec();
  return promise;
};

module.exports = {
  createPrefSlots,
  setpref,
  getfollowups,
  getappointments,
  updatepref,
};
