const generateString = () => {
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let uniqstr1 = '';
  let uniqstr2 = '';
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 15; i++) {
    uniqstr1 += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    uniqstr2 += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  const uniqstr = uniqstr1 + uniqstr2;
  return uniqstr;
};
module.exports = generateString;
