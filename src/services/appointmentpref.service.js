const randomstring = require('randomstring');
const Appointment = require('../models/appointmentpref.model');

const setpref = (body, doctorID, update = false) => {
    // for final schema storage
    const result = {}
    //get all days -> [mon, tue, wed, ...]
    const days = Object.keys(body)

    //iterate over days to calculate NO OF SLOTS of each day
    let noOfSlots = []
    for(let i = 0; i < days.length; i++) {
        noOfSlots.push( calculateDuration(body[days[i]]) / 15 )   
    }

    //mapping no of slots to days
    let daysAndSlots = {};
    days.forEach((day, i) => daysAndSlots[day] = noOfSlots[i]);
    
    const slots = []
   
    //creating slots for each day
    for (let i = 0; i < days.length; i++) {
        //converting 12hr to 24hr
        let startHr = body[days[i]]["FromMeridian"] === 1 ? (body[days[i]]["FromHour"] + 12) % 24 : body[days[i]]["FromHour"]
        let startMin = body[days[i]]["FromMinutes"]
        const element = createSlots( { "FromHour": startHr , "FromMinute": startMin }, days[i] , doctorID, daysAndSlots[days[i]])  
        slots.push(element) 
    }

    
    let Adays = days.map(day => day + "_A")
    let Fdays = days.map(day => day + "_F")

    Adays.forEach((day, i) => result[day] = slots[i][0]);
    Fdays.forEach((day, i) => result[day] = slots[i][1]);
    
    if (!update) {
        result["_id"] = doctorID
        Appointment.create(result)
    }
    return result
}



//****************createSlots******************//
/**
* Create a Slot
* @param {Object} startTime : {FromHour: 5, FromMinute: 45} //24hr format
* @param {String} day : "MON", "TUE", ...
* @param {String} docId : "verifieddocid"
* @param {Number} numberOfSlots
* @returns {Promise<Auth>}
*/

const createSlots = (startTime, day, docId, numberOfSlots) => {
    //af ratio 3: 1
    let a_f = "A"
    //calculate no. of A
    let noOfA = Math.floor( (numberOfSlots/4) * 3 )
    let slotA = []
    let slotF = []
    let FromHr = startTime["FromHour"]
    let FromMins = startTime["FromMinute"]
    let ToHr = startTime["FromHour"]
    let ToMins = startTime["FromMinute"]
    let incrementer = 15

    for (let i = 0; i < numberOfSlots; i++) {
        if(!noOfA) {
            a_f = "F"
        }
        ToMins = (FromMins + incrementer) % 60 ? FromMins + incrementer : 0
        ToHr = ToMins === 0 ? ToHr + 1 : ToHr
        if(ToMins > 60) {
            ToMins %= 60
            ToHr += 1
        }
        ToHr %= 24
        //console.log(ToMins, "  mins  ", ToHr, " hr")
        let slot = {}
        slot["slotId"] = [a_f, day, docId, randomstring.generate(6).toUpperCase() ].join('-')
        slot["FromHour"] = FromHr
        slot["FromMinutes"] = FromMins + 1
        slot["ToHour"] = ToHr
        slot["ToMinutes"] = ToMins

        a_f === "A" ? slotA.push(slot) : slotF.push(slot)

        FromHr = ToHr
        FromMins = ToMins
        noOfA--
    }
    return [slotA, slotF];
}
//*********************************************//



//*************calculateDuration***************//
//calculate total minutes duration between given start time and end time
/**
* Calculate durations of each day
* @param {Object} timeObj : {{"FromHour": 11,"FromMinutes": 0,"FromMeridian": 1,"ToHour": 2,"ToMinutes": 0,"ToMeridian": 0} //12hr format
* @returns {Object}
*/

const calculateDuration = (timeObj) => {
    startTimeHour = timeObj["FromMeridian"] === 1 ? (timeObj["FromHour"] + 12) % 24 : timeObj["FromHour"]
    startTimeMinute =  timeObj["FromMinutes"]
    endTimeHour = timeObj["ToMeridian"] === 1 ? (timeObj["ToHour"] + 12) % 24 : timeObj["ToHour"]
    endTimeMinute = timeObj["ToMinutes"]
    totalTime = startTimeMinute <= endTimeMinute ? (endTimeHour - startTimeHour) * 60 + (endTimeMinute - startTimeMinute) : ((endTimeHour - 1) - startTimeHour) * 60 + ((endTimeMinute +60) - startTimeMinute)
    totalTime = totalTime > 0 ? totalTime : 1440 + totalTime
    return totalTime //in minutes
}
//*********************************************//


const updatepref = (body, docId) => {
    Appointment.findOneAndUpdate(docId, setpref(body, docId, "true" ), {useFindAndModify: false, new: true}, (err, docs) => {
        if(err) {
            console.log(err)
        } else {
            console.log("updatedpref", docs)
        }
    })
    return "data updated"
}

//doctor followup private
const getfollowups = async (docId) => { 
    const promise = await Appointment.findOne({ _id: docId}, { MON_A: 0, TUE_A: 0, WED_A: 0, THU_A: 0, FRI_A: 0, SAT_A: 0, SUN_A: 0}).exec()
    return promise
}

//doctor appointments public
const getappointments = async (docId) => { 
    const promise = await Appointment.find({}, { MON_A: 1, TUE_A: 1, WED_A: 1, THU_A: 1, FRI_A: 1, SAT_A: 1, SUN_A: 1}).exec()
    return promise
}

module.exports = {
    setpref,
    getfollowups,
    getappointments,
    updatepref
};