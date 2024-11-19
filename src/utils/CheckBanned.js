const { authService } = require('../services');

const checkBanned = async (subid) => {
  const AuthData = await authService.getAuthById(subid);
  return AuthData;
};
module.exports = checkBanned;
