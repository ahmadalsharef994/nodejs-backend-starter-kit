const Agenda = require('agenda');
const appointmentService = require('../services/appointment.service');

const dbURL = process.env.MONGODB_URL;
const agenda = new Agenda({
  db: { address: dbURL, collection: 'Agenda' },
  processEvery: '20 seconds',
  useUnifiedTopology: true,
});
agenda.on('ready', () => console.log('Agenda Started')).on('error', () => console.log('Agenda Connection Error'));
agenda.define('createSessions', async (job) => {
  const { appointmentID } = job.attrs;
  await appointmentService.initiateappointmentSession(appointmentID);
});

agenda.start();

module.exports = agenda;
