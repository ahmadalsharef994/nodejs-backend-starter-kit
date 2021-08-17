const generateDoctorID = () => {
  const UniqID = Math.floor(Math.random() * (99999999 - 10000000 + 1) + 10000000);
  return UniqID;
};
module.exports = generateDoctorID;
