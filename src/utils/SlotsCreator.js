const randomstring = require('randomstring');

/**
 * @param {Object} startTime : {FromHour: 5, FromMinute: 45}    //24hr format
 * @param {String} day : "MON"
 * @param {String} docId : "docid"
 * @param {Number} duration : "120"   // total duration in mins
 * @returns {Object} : // appointment and followup slots
 */

const createSlots = (startTime, day, docId, duration) => {
  // let typeAF = 'A';
  // 3:1 ratio
  // let noOfA = Math.round(duration / 20);
  // let gap = Math.round(duration / 40)
  // const totalSlots = noOfA + gap;
  const totalSlots = Math.round(duration / 15);
  // const slotA = [];
  // const slotF = [];
  const slots = [];
  let FromHr = startTime.FromHour;
  let FromMins = startTime.FromMinute;
  let ToHr = startTime.FromHour;
  let ToMins = startTime.FromMinute;
  const incrementer = 15;

  for (let i = 0; i < totalSlots; i += 1) {
    // if (!noOfA) {
    //   typeAF = 'F';
    //   incrementer = 10;
    // }
    ToMins = (FromMins + incrementer) % 60 ? FromMins + incrementer : 0;
    ToHr = ToMins === 0 ? ToHr + 1 : ToHr;
    if (ToMins > 60) {
      ToMins %= 60;
      ToHr += 1;
    }
    ToHr %= 24;
    const slot = {};
    slot.slotId = [
      // typeAF,
      day,
      docId,
      i + 1 + randomstring.generate({ length: 6, charset: 'alphabetic' }).toUpperCase(),
    ].join('-');
    slot.FromHour = FromHr;
    slot.FromMinutes = FromMins + 1;
    slot.ToHour = ToHr;
    slot.ToMinutes = ToMins;
    // eslint-disable-next-line no-unused-expressions
    // typeAF === 'A' ? slotA.push(slot) : slotF.push(slot);
    slots.push(slot);
    FromHr = ToHr;
    FromMins = ToMins;
    // noOfA -= 1;
  }
  // return [slotA, slotF];
  return slots;
};

/**
 * @param {Object} timeObjectArray : [{"FromHour": 11,"FromMinutes": 0,"ToHour": 2,"ToMinutes": 0 }]   //24hr format
 * @returns {Object} : [ 120, 120 ]   // total duration
 */

const calculateDuration = async (timeObjectArray) => {
  const totalTimeArr = [];
  timeObjectArray.forEach((timeObj) => {
    const startTimeHour = timeObj.FromHour;
    const startTimeMinute = timeObj.FromMinutes;
    const endTimeHour = timeObj.ToHour;
    const endTimeMinute = timeObj.ToMinutes;
    let totalTime =
      startTimeMinute <= endTimeMinute
        ? (endTimeHour - startTimeHour) * 60 + (endTimeMinute - startTimeMinute)
        : (endTimeHour - 1 - startTimeHour) * 60 + (endTimeMinute + 60 - startTimeMinute);
    totalTime = totalTime > 0 ? totalTime : 1440 + totalTime;
    totalTimeArr.push(totalTime);
  });

  return totalTimeArr;
};

module.exports = {
  createSlots,
  calculateDuration,
};
