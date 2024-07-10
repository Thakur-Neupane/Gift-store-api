export const otpGenerator = (length = 6) => {
  let str = "";

  for (let i = 0; i < length; i++) {
    str += Math.round(Math.random() * 10);
  }
  return str;
};
