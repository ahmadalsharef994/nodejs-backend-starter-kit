const axios = require('axios');
const ApiError = require('../utils/ApiError');
const DyteSession = require('../models/dyteSession.model');

const getDyteSessionByAppointmentId = async (appointmentID) => {
  const dyteSession = await DyteSession.findOne({ appointmentId: appointmentID });
  return dyteSession;
};

// to initiate a meeting
const InitiateMeetingRoom = async (appointmentID) => {
  const InitMeeting = JSON.stringify({
    title: appointmentID,
    presetName: 'Appointment',
    authorization: { closed: false },
  });
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `${process.env.DYTEKey}`,
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
      throw new ApiError(400, `Error Generating Video Session: ${error}`);
    });

  return Meetingresult;
};

const addDoctorParticipantToMeeting = async (meetingID, doctorAuthId) => {
  const AddDoctorToMeeting = JSON.stringify({
    clientSpecificId: doctorAuthId,
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
    .catch((error) => {
      throw new ApiError(400, `Error Adding Doctor Participant Video Session${error}`);
    });

  return DocParticipantresult;
};

const addUserParticipantToMeeting = async (meetingID, userAuthId) => {
  const AddUserToMeeting = JSON.stringify({
    clientSpecificId: userAuthId,
    presetName: 'Appointment',
  });
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: ` ${process.env.DYTEKey}`,
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
      throw new ApiError(400, `Error Adding User Participant Video Session${error}`);
    });

  return UserParticipantresult;
};
// creating tokens for dyte meeting
const createDyteMeeting = async (appointmentID, doctorAuthId, userAuthId) => {
  const meetingroom = await InitiateMeetingRoom(appointmentID);
  // Wait for 1 second to give the meeting enough time to be created
  const doctorparticipation = await addDoctorParticipantToMeeting(meetingroom.meeting.id, doctorAuthId);
  const userparticipation = await addUserParticipantToMeeting(meetingroom.meeting.id, userAuthId);
  const existingSession = await DyteSession.findOne({ appointmentId: appointmentID });
  if (existingSession) {
    existingSession.meetingroom = meetingroom;
    existingSession.doctorparticipation = doctorparticipation;
    existingSession.userparticipation = userparticipation;
    return existingSession;
    // throw new ApiError(400, 'There was Already A Session Intiated For This Appointment Use appointment id to Live Join !');
  }
  const dyteSession = await DyteSession.create({
    appointmentId: appointmentID,
    doctorAuthId,
    userAuthId,
    meetingId: meetingroom.meeting.id,
    roomName: meetingroom.meeting.roomName,
    doctorToken: doctorparticipation.authResponse.authToken,
    userToken: userparticipation.authResponse.authToken,
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
  getDyteSessionByAppointmentId,
  // InitiateMeetingRoom,
  // addDoctorParticipantToMeeting,
  // addUserParticipantToMeeting,
  createDyteMeeting,
};
