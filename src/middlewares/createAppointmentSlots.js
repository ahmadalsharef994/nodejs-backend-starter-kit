const randomstring = require('randomstring');

/**
 * Create a Slot
 * @param {Object} startTime : {FromHour: 5, FromMinute: 45} //24hr format
 * @param {String} day : "MON"
 * @param {String} docId : "verifieddocid"
 * @param {Number} numberOfSlots
 * @returns {Promise<Auth>}
 */

const createAppointmentSlots = async (startTime, day, docId, numberOfSlots) => {
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

module.exports = createAppointmentSlots;
