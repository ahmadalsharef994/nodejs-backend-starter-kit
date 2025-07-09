const allRoles = {
  user: ['getProfile', 'updateProfile', 'bookEvent', 'sendMessage', 'makePayment'],
  admin: ['getProfile', 'updateProfile', 'manageUsers', 'manageEvents', 'manageSystem', 'accessAnalytics'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

export { roles, roleRights };
