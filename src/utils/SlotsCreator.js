const randomstring = require('randomstring');

/**
 * @param {Object} startTime : {FromHour: 5, FromMinute: 45}    //24hr format
 * @param {String} day : "MON"
 * @param {String} docId : "docid"
 * @param {Number} duration : "120"   // total duration in mins
 * @returns {Object} : // appointment and followup slots
 */

const createSlots = async (startTime, day, docId, duration) => {
  let typeAF = 'A';
  // 3:1 ratio
  let noOfA = Math.round(duration / 20);
  const totalSlots = noOfA + Math.round(duration / 40);
  const slotA = [];
  const slotF = [];
  let FromHr = startTime.FromHour;
  let FromMins = startTime.FromMinute;
  let ToHr = startTime.FromHour;
  let ToMins = startTime.FromMinute;
  let incrementer = 15;

  for (let i = 0; i < totalSlots; i += 1) {
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
    const slot = {};
    slot.slotId = [
      typeAF,
      day,
      docId,
      i + 1 + randomstring.generate({ length: 6, charset: 'alphabetic' }).toUpperCase(),
    ].join('-');
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
 * @param {Object} timeObj : {{"FromHour": 11,"FromMinutes": 0,"ToHour": 2,"ToMinutes": 0 }   //24hr format
 * @returns {Object} : "120"   // total duration
 */

const calculateDuration = async (timeObj) => {
  const startTimeHour = timeObj.FromHour;
  const startTimeMinute = timeObj.FromMinutes;
  const endTimeHour = timeObj.ToHour;
  const endTimeMinute = timeObj.ToMinutes;
  let totalTime =
    startTimeMinute <= endTimeMinute
      ? (endTimeHour - startTimeHour) * 60 + (endTimeMinute - startTimeMinute)
      : (endTimeHour - 1 - startTimeHour) * 60 + (endTimeMinute + 60 - startTimeMinute);
  totalTime = totalTime > 0 ? totalTime : 1440 + totalTime;
  return totalTime;
};

module.exports = {
  createSlots,
  calculateDuration,
};
