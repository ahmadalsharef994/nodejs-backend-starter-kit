const httpStatus = require('http-status');

const deviceauth = () => async (req, res, next) => {
  try {
    const devicehash = req.headers.devicehash;
    const devicetype = req.headers.devicetype;
    // const fcmtoken = req.headers.fcmtoken;
    if (devicehash === undefined || devicetype === undefined) {
      res.status(400).json({ message: 'Device Registration Failed' });
    } else if (devicetype === 'web') {
      next();
    } else if (devicetype === 'ios') {
      next();
    } else if (devicetype === 'android') {
      next();
    } else if (devicetype === 'unknown') {
      next();
    } else {
      res.status(400).json({ message: 'DeviceType Authentication Failed' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Device Registration Failed' });
  }
};

module.exports = deviceauth;
