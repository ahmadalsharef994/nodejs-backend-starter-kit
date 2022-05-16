const autoReplyUser = async (AuthData) => {
  // const user = await authService.getAuthById(AuthData._id);
  return `Hello ${AuthData.fullname}. Please select Symptoms`;
};

const autoReplySymptoms = async (symptoms) => {
  return symptoms;
};

module.exports = { autoReplyUser, autoReplySymptoms };
