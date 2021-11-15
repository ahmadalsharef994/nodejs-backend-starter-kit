const agenda = require('./agendasetup');

const ScheduleSessionJob = async (appointmentID, startTime) => {
  const datetime = startTime.getTime() - 300000; // This comes appointment start time - 5 minutes, 300000 is Milisecond offset
  await agenda.schedule(datetime, 'createSessions', { appointment: appointmentID }); // Run the dummy job in 10 minutes and passing data.
};
module.exports = {
  ScheduleSessionJob,
};
