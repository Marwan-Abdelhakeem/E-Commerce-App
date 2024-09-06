import jwt from "jsonwebtoken";

export const generateToken = ({
  payload,
  secretKey = "secretKey",
  expiresIn = "30d",
}) => {
  return jwt.sign(payload, secretKey, { expiresIn });
};

export const verifyToken = ({ token, secretKey = "secretKey" }) => {
  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    return { message: error.message };
  }
};
