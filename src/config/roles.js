const allRoles = {
  user: [],
  doctor: [],
  admin: [],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(); // No explicit rights needed since middleware handles permissions

module.exports = {
  roles,
};
