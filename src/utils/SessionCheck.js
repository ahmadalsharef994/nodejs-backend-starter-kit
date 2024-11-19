// const { authService } = require('../services');
const { Devices, Token } = require('../models');

const SessionCheck = async (token) => {
  const SessionDataDevice = await Devices.findOne({ authtoken: token, loggedstatus: false });
  const SessionDataToken = await Token.findOne({ token });
  if (SessionDataDevice || SessionDataToken) {
    return true;
  }
  return false;
};

module.exports = SessionCheck;
