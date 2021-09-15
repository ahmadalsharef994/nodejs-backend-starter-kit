const { appointmentPreferenceService } = require('../services');

const submitAppointmentPreference = async (req, res) => {
  const result = await appointmentPreferenceService.createPreference(req.body, req.verifieddocid);
  res.status(201).json(result);
};

const updateAppointmentPreference = async (req, res) => {
  const result = await appointmentPreferenceService.updatePreference(req.body, req.verifieddocid);
  res.status(200).json(result);
};

const showfollowups = async (req, res) => {
  appointmentPreferenceService.getfollowups(req.verifieddocid).then((err, result) => {
    if (err) {
      return res.status(404).json(err);
    }
    return res.status(200).json(result);
  });
};

const showappointments = async (req, res) => {
  appointmentPreferenceService.getappointments().then((err, result) => {
    if (err) {
      return res.status(404).json(err);
    }
    return res.status(200).json(result);
  });
};

module.exports = {
  submitAppointmentPreference,
  updateAppointmentPreference,
  showfollowups,
  showappointments,
};
