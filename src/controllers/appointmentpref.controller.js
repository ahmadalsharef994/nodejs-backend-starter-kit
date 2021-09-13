const { appointmentPrefService } = require('../services');
const catchAsync = require('../utils/catchAsync');


const submitDoctorAppointmentPref = catchAsync(async (req, res) => {
  const preferenceData = await appointmentPrefService.setpref(req.body, req.verifieddocid);
  res.status(201).json(preferenceData);
});



const newpref = (req, res) => {
  const result = appointmentPrefService.setpref(req.body, req.verifieddocid);
  res.json(result);
};

const showfollowups = (req, res) => {
  const query = appointmentPrefService.getfollowups(req.verifieddocid);
  query.then((err, result) => {
    if (err) {
      return res.json(err);
    }
    return res.json(result);
  });
};

const showpappointments = (req, res) => {
  const query = appointmentPrefService.getappointments();
  query.then((err, result) => {
    if (err) {
      return res.json(err);
    }
    return res.json(result);
  });
};

const changepref = (req, res) => {
  const result = appointmentPrefService.updatepref(req.body, req.verifieddocid);
  res.json(result);
};

module.exports = {
  newpref,
  showfollowups,
  showpappointments,
  changepref,
  submitDoctorAppointmentPref,
};
