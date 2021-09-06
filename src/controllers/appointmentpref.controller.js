const { json } = require('express');
const { authService, appointmentPrefService } = require('../services');

//create new slots
const newpref = (req, res) => {
    const dociD = "niteshx777" //req.verifieddocid
    const result = appointmentPrefService.setpref(req.body, dociD)
    res.json(result)
}

//doctor view - followups
const showfollowups = (req, res) => {
    const dociD = "niteshx123" //req.verifieddocid
    const query = appointmentPrefService.getfollowups(dociD)
    query.then((err, result) => {
        if(err) {
            return res.json(err)
        } else {
            return res.json(result)
        }
     })
}

//user view - appointments
const showpappointments = (req, res) => {
    const query = appointmentPrefService.getappointments()
    query.then((err, result) => {
        if(err) {
            return res.json(err)
        } else {
            return res.json(result)
        }
     })
}

//update slots
const changepref = (req, res) => {
    const dociD = "niteshx123" //req.verifieddocid
    const result = appointmentPrefService.updatepref(req.body, dociD)
    console.log(result)
    res.json(result)
}



module.exports = {
    newpref,
    showfollowups,
    showpappointments,
    changepref
};