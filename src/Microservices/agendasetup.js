const Agenda = require('agenda');
const appointmentService = require('../services/appointment.service');

const dbURL = 'mongodb://127.0.0.1:27017/AgendaMedium';
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
/* const CreateSessionJob = async () => {
  await agenda.start(); // Start Agenda instance
  const date = '2021-11-09T13:44:24.624Z';
  await agenda.schedule('in 5 seconds', 'createSessions', { name: 'Medium' }); // Run the dummy job in 10 minutes and passing data.
}; */

agenda.start();

module.exports = agenda;
