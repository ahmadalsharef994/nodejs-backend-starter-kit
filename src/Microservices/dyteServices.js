const axios = require('axios');
const ApiError = require('../utils/ApiError');
const AppointmentSession = require('../models/appointmentSession.model');

const InitiateMeetingRoom = async (appointmentID) => {
  const InitMeeting = JSON.stringify({
    title: appointmentID,
    presetName: 'Appointment',
    authorization: { closed: true },
  });
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `APIKEY ${process.env.DYTEKey}`,
  };
  let Meetingresult = '';

  await axios
    .post(`https://api.cluster.dyte.in/v1/organizations/${process.env.DYTEorganisation}/meeting`, InitMeeting, {
      headers,
    })
    .then((response) => {
      Meetingresult = response.data.data;
    })
    .catch((error) => {
      throw new ApiError(400, 'Error Generating Video Session');
    });

  return Meetingresult;
};

const addDoctorParticipantToMeeting = async (meetingID, doctorId) => {
  const AddDoctorToMeeting = JSON.stringify({
    userDetails: {
      name: 'DoctorName',
    },
    clientSpecificId: doctorId,
    presetName: 'Appointment',
  });
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `APIKEY ${process.env.DYTEKey}`,
  };
  console.log(AddDoctorToMeeting);
  let DocParticipantresult = '';
  await axios
    .post(
      `https://api.cluster.dyte.in/v1/organizations/${process.env.DYTEorganisation}/meetings/${meetingID}/participant`,
      AddDoctorToMeeting,
      {
        headers,
      }
    )
    .then((response) => {
      DocParticipantresult = response.data.data;
    })
    .catch((error) => {
      console.log(error.response.data);
      throw new ApiError(400, 'Error Adding Doctor Participant Video Session');
    });

  return DocParticipantresult;
};

const addUserParticipantToMeeting = async (meetingID, patientId) => {
  const AddUserToMeeting = JSON.stringify({
    userDetails: {
      name: 'UserFullName',
    },
    clientSpecificId: patientId,
    presetName: 'Appointment',
  });
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `APIKEY ${process.env.DYTEKey}`,
  };
  let UserParticipantresult = '';
  await axios
    .post(
      `https://api.cluster.dyte.in/v1/organizations/${process.env.DYTEorganisation}/meetings/${meetingID}/participant`,
      AddUserToMeeting,
      {
        headers,
      }
    )
    .then((response) => {
      UserParticipantresult = response.data.data;
    })
    .catch((error) => {
      console.log(error.response.data);
      throw new ApiError(400, 'Error Adding User Participant Video Session');
    });

  return UserParticipantresult;
};

const createDyteMeeting = async (appointmentID, doctorId, patientId) => {
  const meetingroom = await InitiateMeetingRoom(appointmentID);
  console.log(meetingroom);
  const doctorparticipation = await addDoctorParticipantToMeeting(meetingroom.meeting.id, doctorId);
  const userparticipation = await addUserParticipantToMeeting(meetingroom.meeting.id, patientId);
  const SaveSession = await AppointmentSession.create({
    appointmentid: appointmentID,
    AuthDoctor: doctorId,
    AuthUser: patientId,
    dytemeetingid: meetingroom.meeting.id,
    dyteroomname: meetingroom.meeting.roomName,
    dytedoctortoken: doctorparticipation.authResponse.authToken,
    dyteusertoken: userparticipation.authResponse.authToken,
  });
  return { meetingroom, doctorparticipation, userparticipation };
};

module.exports = {
  createDyteMeeting,
};
