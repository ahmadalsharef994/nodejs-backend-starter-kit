const agenda = require('./agendasetup');

const ScheduleSessionJob = async (appointmentID) => {
  const datetime = '2021-11-09T14:30:24.642Z'; // This comes appointment start time - 5 minutes
  await agenda.schedule(datetime, 'createSessions', { appointment: appointmentID }); // Run the dummy job in 10 minutes and passing data.
};
module.exports = {
  ScheduleSessionJob,
};
