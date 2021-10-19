const httpStatus = require('http-status');

const deviceauth = () => async (req, res, next) => {
  try {
    const devicehash = req.headers.devicehash;
    const devicetype = req.headers.devicetype;
    const fcmtoken = req.headers.fcmtoken;
    if (devicehash === undefined || devicetype === undefined || fcmtoken === undefined) {
      res.status(httpStatus.BAD_REQUEST).json({ message: 'Device Registration Failed' });
    }
    if (devicetype !== ('web' || 'ios' || 'android' || 'unknown')) {
      res.status(httpStatus.BAD_REQUEST).json({ message: 'DeviceType Authentication Failed' });
    } else {
      next();
    }
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Device Registration Failed' });
  }
};

module.exports = deviceauth;
