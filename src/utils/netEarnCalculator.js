const netEarnCalculator = (amount, taxes = 0.05, serviceCharges = 0.1, TDS = 0) => {
  const remain1 = amount - amount * taxes;
  const remain2 = remain1 - remain1 * serviceCharges;
  const remain3 = remain2 - remain2 * TDS;
  return remain3;
};

module.exports = netEarnCalculator;
