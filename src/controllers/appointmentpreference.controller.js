const { appointmentPreferenceService } = require('../services');

const submitAppointmentPreference = async (req, res) => {
  const result = await appointmentPreferenceService.createPreference(req.body, req.verifieddocid);
  res.json(result);
};

const updateAppointmentPreference = async (req, res) => {
  const result = await appointmentPreferenceService.updatePreference(req.body, req.verifieddocid);
  res.json(result);
};

const showfollowups = async (req, res) => {
  appointmentPreferenceService.getfollowups(req.verifieddocid).then((err, result) => {
    if (err) {
      return res.json(err);
    }
    return res.json(result);
  });
};

const showappointments = async (req, res) => {
  appointmentPreferenceService.getappointments().then((err, result) => {
    if (err) {
      return res.json(err);
    }
    return res.json(result);
  });
};

module.exports = {
  submitAppointmentPreference,
  updateAppointmentPreference,
  showfollowups,
  showappointments,
};
