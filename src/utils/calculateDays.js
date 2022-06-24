const daysDiff = (day2, day1) => {
  const difference = day2 - day1;
  const days = Math.ceil(difference / (1000 * 3600 * 24));
  return days;
};

module.exports = daysDiff;
