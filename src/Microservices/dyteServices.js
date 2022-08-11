const axios = require('axios');
const ApiError = require('../utils/ApiError');
const DyteSession = require('../models/dyteSession.model');

// to initiate a meeting
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
    .catch(() => {
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
    .catch(() => {
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
    .catch(() => {
      throw new ApiError(400, 'Error Adding User Participant Video Session');
    });

  return UserParticipantresult;
};
// creating tokens for dyte meeting
const createDyteMeeting = async (appointmentID, doctorId, patientId) => {
  const meetingroom = await InitiateMeetingRoom(appointmentID);
  const doctorparticipation = await addDoctorParticipantToMeeting(meetingroom.meeting.id, doctorId);
  const userparticipation = await addUserParticipantToMeeting(meetingroom.meeting.id, patientId);
  const existingSession = await DyteSession.findOne({ appointmentid: appointmentID });
  if (existingSession) {
    existingSession.meetingroom = meetingroom;
    existingSession.doctorparticipation = doctorparticipation;
    existingSession.userparticipation = userparticipation;
    return existingSession;
    // throw new ApiError(400, 'There was Already A Session Intiated For This Appointment Use appointment id to Live Join !');
  }
  const dyteSession = await DyteSession.create({
    appointmentid: appointmentID,
    AuthDoctor: doctorId,
    AuthUser: patientId,
    dytemeetingid: meetingroom.meeting.id,
    dyteroomname: meetingroom.meeting.roomName,
    dytedoctortoken: doctorparticipation.authResponse.authToken,
    dyteusertoken: userparticipation.authResponse.authToken,
  });
  if (!dyteSession) {
    throw new ApiError(400, 'Error Triggered it to Developer DYTE Services down');
  }
  dyteSession.meetingroom = meetingroom;
  dyteSession.doctorparticipation = doctorparticipation;
  dyteSession.userparticipation = userparticipation;
  return dyteSession;
};

module.exports = {
  createDyteMeeting,
};
