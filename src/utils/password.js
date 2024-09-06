import pkg from "bcrypt";
export const hashPassword = ({ password, saltRound = 8 }) => {
  return pkg.hashSync(password, saltRound);
};

export const comparePassword = ({ password, hashPassword }) => {
  return pkg.compareSync(password, hashPassword);
};

export const generateTempPassword = (length = 8) => {
  return Math.random().toString(36).slice(-length);
};
